const mongoose = require("mongoose");
const Ticket = require("../models/ticketModel");
const User = require("../models/userModel");
const { sendTicketUpdateEmail } = require("../utils/emailService");

// FSM: allowed transitions per role
const FSM = {
  employee: { resolved: "open" },                          // reopen only
  agent: { open: "in-progress", "in-progress": "resolved" },
  admin: { open: "in-progress", "in-progress": "resolved", resolved: "closed", "in-progress": "closed", open: "closed" },
};

const getAll = async (req, res) => {
  try {
    const { status, priority, category, assignedTo, search, limit = 50, skip = 0 } = req.query;
    let query = {};

    // 📍 Location Filtering: Agents only see tickets from their city
    if (req.user.role === "agent" && req.user.location?.city) {
      query["location.city"] = req.user.location.city;
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    // 🔍 Convert string IDs to ObjectIds for Aggregation Match
    if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
      query.assignedTo = new mongoose.Types.ObjectId(assignedTo);
    }
    if (req.query.createdBy && mongoose.Types.ObjectId.isValid(req.query.createdBy)) {
      query.createdBy = new mongoose.Types.ObjectId(req.query.createdBy);
    }

    if (search) {
      const q = new RegExp(search, "i");
      query.$or = [{ title: q }, { description: q }];
    }


    // Advanced sorting using Aggregation
    const tickets = await Ticket.aggregate([
      { $match: query },
      // 🥇 Map Status to Weight (Lower is higher priority in list)
      {
        $addFields: {
          statusWeight: {
            $switch: {
              branches: [
                { case: { $eq: ["$status", "open"] }, then: 1 },
                { case: { $eq: ["$status", "in-progress"] }, then: 2 },
                { case: { $eq: ["$status", "resolved"] }, then: 3 }
              ],
              default: 4
            }
          },
          // 🥈 Map Priority to Weight
          priorityWeight: {
            $switch: {
              branches: [
                { case: { $eq: ["$priority", "critical"] }, then: 1 },
                { case: { $eq: ["$priority", "high"] }, then: 2 },
                { case: { $eq: ["$priority", "medium"] }, then: 3 },
                { case: { $eq: ["$priority", "low"] }, then: 4 }
              ],
              default: 5
            }
          }
        }
      },
      // 🥉 Execute Multi-level Sort
      { $sort: { statusWeight: 1, priorityWeight: 1, createdAt: -1 } },
      { $skip: parseInt(skip) },
      { $limit: parseInt(limit) },
      // 🏁 Final Step: Populate references (aggregate doesn't support .populate())
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdBy"
        }
      },
      { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          localField: "assignedTo",
          foreignField: "_id",
          as: "assignedTo"
        }
      },
      { $unwind: { path: "$assignedTo", preserveNullAndEmptyArrays: true } },
      // Project fields to match the expected format and remove internal weights
      {
        $project: {
          statusWeight: 0,
          priorityWeight: 0,
          "createdBy.passwordHash": 0,
          "assignedTo.passwordHash": 0
        }
      }
    ]);

    const count = await Ticket.countDocuments(query);
    res.json({ count, tickets, total: count, hasMore: parseInt(skip) + parseInt(limit) < count });
  } catch (err) { res.status(500).json({ error: err.message }); }
};


const getMine = async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;
    const tickets = await Ticket.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate("assignedTo", "name email role");
    const count = await Ticket.countDocuments({ createdBy: req.user.id });
    res.json({ count, tickets, hasMore: parseInt(skip) + parseInt(limit) < count });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("createdBy", "name email role location")
      .populate("assignedTo", "name email role")
      .maxTimeMS(5000);  // 5 second timeout to prevent hanging

    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    if (req.user.role === "employee" && String(ticket.createdBy._id) !== String(req.user.id))
      return res.status(403).json({ error: "Access denied" });

    // Ensure arrays exist for frontend
    if (!ticket.comments) ticket.comments = [];
    if (!ticket.activityLog) ticket.activityLog = [];

    res.json(ticket);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const create = async (req, res) => {
  try {
    const { title, description, priority = "medium", category = "task" } = req.body;
    if (!title || !description) return res.status(400).json({ error: "title and description are required" });

    const PRIORITIES = ["low", "medium", "high", "critical"];
    const p = PRIORITIES.includes(priority) ? priority : "medium";

    // simple sla calculation
    const hours = { low: 72, medium: 48, high: 24, critical: 4 }[p];
    const sla_due_at = new Date(Date.now() + hours * 60 * 60 * 1000);

    const ticket = new Ticket({
      title, description, status: "open", priority: p,
      category, createdBy: req.user.id,
      location: req.user.location || { city: "Surat", state: "Gujarat", area: "" },
      activityLog: [{ user: req.user.id, action: "Ticket created" }],
      sla_due_at
    });


    await ticket.save();
    res.status(201).json(ticket);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const updateStatus = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    const { status } = req.body;
    const role = req.user.role;

    // admin can force-close
    if (role === "admin" && status === "closed") {
      ticket.status = "closed";
      ticket.activityLog.push({ user: req.user.id, action: `Status changed to closed` });
      await ticket.save();
      return res.json(ticket);
    }

    const allowed = FSM[role]?.[ticket.status];
    if (!allowed || allowed !== status)
      return res.status(400).json({ error: `Invalid transition: ${ticket.status} → ${status} for role ${role}` });

    ticket.status = status;
    ticket.activityLog.push({ user: req.user.id, action: `Status changed to ${status}` });
    await ticket.save();

    // Auto-Notify Customer (Non-blocking)
    ticket.populate("createdBy", "name email").then(t => {
      if (t.createdBy && t.createdBy.email) {
        sendTicketUpdateEmail(t.createdBy.email, t.createdBy.name, t._id, status)
          .catch(e => console.error("Update email failed: ", e));
      }
    });


    res.json(ticket);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const assign = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    const targetAgentId = req.body.assignedTo || req.user.id;

    // Agents can only assign to themselves — check if they're online first
    // Admins bypass this check so they can assign to any agent regardless
    if (req.user.role === "agent") {
      const agent = await User.findById(targetAgentId);
      if (agent && !agent.isAvailable) {
        return res.status(403).json({
          error: "You are currently offline. Go Online to claim tickets."
        });
      }
    }

    ticket.assignedTo = targetAgentId;
    ticket.activityLog.push({ user: req.user.id, action: `Assigned ticket` });
    await ticket.save();

    // Auto-Notify Customer of assignment (Non-blocking)
    ticket.populate("createdBy", "name email").then(t => {
      if (t.createdBy && t.createdBy.email) {
        sendTicketUpdateEmail(t.createdBy.email, t.createdBy.name, t._id, "Assigned to Agent")
          .catch(e => console.error("Assignment email failed: ", e));
      }
    });


    res.json(ticket);
  } catch (err) { res.status(500).json({ error: err.message }); }
};


const updatePriority = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    const PRIORITIES = ["low", "medium", "high", "critical"];
    const { priority } = req.body;
    if (!PRIORITIES.includes(priority)) return res.status(400).json({ error: `priority must be one of: ${PRIORITIES.join(", ")}` });

    ticket.priority = priority;
    ticket.activityLog.push({ user: req.user.id, action: `Priority changed to ${priority}` });
    await ticket.save();
    res.json(ticket);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const remove = async (req, res) => {
  try {
    const deleted = await Ticket.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Ticket not found" });
    res.json({ message: "Ticket deleted", ticket: deleted });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getStats = async (req, res) => {
  try {
    // Parallel counts for performance
    const [total, open, inProgress, resolved, closed, slaBreached] = await Promise.all([
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: "open" }),
      Ticket.countDocuments({ status: "in-progress" }),
      Ticket.countDocuments({ status: "resolved" }),
      Ticket.countDocuments({ status: "closed" }),
      Ticket.countDocuments({ sla_due_at: { $lt: new Date() }, status: { $nin: ["resolved", "closed"] } })
    ]);

    // Get priority breakdown
    const priorityData = await Ticket.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } }
    ]);

    const byPriority = { low: 0, medium: 0, high: 0, critical: 0 };
    priorityData.forEach(p => {
      if (byPriority.hasOwnProperty(p._id)) byPriority[p._id] = p.count;
    });

    res.json({ total, open, inProgress, resolved, closed, slaBreached, byPriority });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getComments = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate("comments.user", "name email");
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json({ comments: ticket.comments || [] });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const addComment = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "message is required" });

    ticket.comments.push({ user: req.user.id, message });
    await ticket.save();
    await ticket.populate("comments.user", "name email");
    res.json({ comments: ticket.comments });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getAll, getMine, getById, create, updateStatus, assign, updatePriority, remove, getStats, getComments, addComment };
