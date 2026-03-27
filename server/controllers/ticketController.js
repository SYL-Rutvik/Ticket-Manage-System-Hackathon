const Ticket = require("../models/ticketModel");

// FSM: allowed transitions per role
const FSM = {
  employee: { resolved: "open" },                          // reopen only
  agent:    { open: "in-progress", "in-progress": "resolved" },
  admin:    { open: "in-progress", "in-progress": "resolved", resolved: "closed", "in-progress": "closed", open: "closed" },
};

const getAll = async (req, res) => {
  try {
    const { status, priority, category, assignedTo, search } = req.query;
    let query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) {
      const q = new RegExp(search, "i");
      query.$or = [{ title: q }, { description: q }];
    }
    const tickets = await Ticket.find(query).sort({ createdAt: -1 }).populate("createdBy", "name email role").populate("assignedTo", "name email role");
    res.json({ count: tickets.length, tickets });
  } catch(err) { res.status(500).json({error: err.message}); }
};

const getMine = async (req, res) => {
  try {
    const tickets = await Ticket.find({ createdBy: req.user.id }).sort({ createdAt: -1 }).populate("assignedTo", "name email role");
    res.json({ count: tickets.length, tickets });
  } catch(err) { res.status(500).json({error: err.message}); }
};

const getById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .populate("comments.user", "name email role")
      .populate("activityLog.user", "name email role");

    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    if (req.user.role === "employee" && String(ticket.createdBy._id) !== String(req.user.id))
      return res.status(403).json({ error: "Access denied" });
    
    res.json(ticket);
  } catch(err) { res.status(500).json({error: err.message}); }
};

const create = async (req, res) => {
  try {
    const { title, description, priority = "medium", category = "task" } = req.body;
    if (!title || !description) return res.status(400).json({ error: "title and description are required" });

    const PRIORITIES = ["low","medium","high","critical"];
    const p = PRIORITIES.includes(priority) ? priority : "medium";

    // simple sla calculation
    const hours = { low: 72, medium: 48, high: 24, critical: 4 }[p];
    const sla_due_at = new Date(Date.now() + hours * 60 * 60 * 1000);

    const ticket = new Ticket({
      title, description, status: "open", priority: p,
      category, createdBy: req.user.id,
      activityLog: [{ user: req.user.id, action: "Ticket created" }],
      sla_due_at
    });
    
    await ticket.save();
    res.status(201).json(ticket);
  } catch(err) { res.status(500).json({error: err.message}); }
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
    res.json(ticket);
  } catch(err) { res.status(500).json({error: err.message}); }
};

const assign = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    const { assignedTo } = req.body;
    ticket.assignedTo = assignedTo || req.user.id;
    ticket.activityLog.push({ user: req.user.id, action: `Assigned ticket` });
    await ticket.save();
    res.json(ticket);
  } catch(err) { res.status(500).json({error: err.message}); }
};

const updatePriority = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    const PRIORITIES = ["low","medium","high","critical"];
    const { priority } = req.body;
    if (!PRIORITIES.includes(priority)) return res.status(400).json({ error: `priority must be one of: ${PRIORITIES.join(", ")}` });

    ticket.priority = priority;
    ticket.activityLog.push({ user: req.user.id, action: `Priority changed to ${priority}` });
    await ticket.save();
    res.json(ticket);
  } catch(err) { res.status(500).json({error: err.message}); }
};

const remove = async (req, res) => {
  try {
    const deleted = await Ticket.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Ticket not found" });
    res.json({ message: "Ticket deleted", ticket: deleted });
  } catch(err) { res.status(500).json({error: err.message}); }
};

const getStats = async (req, res) => {
  try {
    // Basic stats implementation
    const total = await Ticket.countDocuments();
    const open = await Ticket.countDocuments({ status: "open" });
    const inProgress = await Ticket.countDocuments({ status: "in-progress" });
    const resolved = await Ticket.countDocuments({ status: "resolved" });
    const closed = await Ticket.countDocuments({ status: "closed" });
    const slaBreached = await Ticket.countDocuments({ sla_due_at: { $lt: new Date() }, status: { $nin: ["resolved", "closed"] } });
    
    // priorities
    const byPriority = {};
    for (const p of ["low", "medium", "high", "critical"]) {
      byPriority[p] = await Ticket.countDocuments({ priority: p });
    }

    res.json({ total, open, inProgress, resolved, closed, slaBreached, byPriority });
  } catch(err) { res.status(500).json({error: err.message}); }
};

module.exports = { getAll, getMine, getById, create, updateStatus, assign, updatePriority, remove, getStats };
