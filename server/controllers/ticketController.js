const ticketModel = require("../models/ticketModel");
const auditModel  = require("../models/auditModel");
const slaModel    = require("../models/slaModel");

// FSM: allowed transitions per role
const FSM = {
  customer: { resolved: "open" },                          // reopen only
  agent:    { open: "in-progress", "in-progress": "resolved" },
  admin:    { open: "in-progress", "in-progress": "resolved", resolved: "closed", "in-progress": "closed", open: "closed" },
};

const getAll = (req, res) => {
  let result = ticketModel.getAll();
  const { status, priority, category, assignedTo, search } = req.query;
  if (status)     result = result.filter((t) => t.status === status);
  if (priority)   result = result.filter((t) => t.priority === priority);
  if (category)   result = result.filter((t) => t.category === category);
  if (assignedTo) result = result.filter((t) => t.assignedTo === parseInt(assignedTo));
  if (search) {
    const q = search.toLowerCase();
    result = result.filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
  }
  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ count: result.length, tickets: result });
};

const getMine = (req, res) => {
  const tickets = ticketModel.getByUser(req.user.id);
  res.json({ count: tickets.length, tickets });
};

const getById = (req, res) => {
  const ticket = ticketModel.getById(req.params.id);
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  // customers can only see their own
  if (req.user.role === "customer" && ticket.createdBy !== req.user.id)
    return res.status(403).json({ error: "Access denied" });
  res.json(ticket);
};

const create = (req, res) => {
  const { title, description, priority = "medium", category = "task" } = req.body;
  if (!title || !description)
    return res.status(400).json({ error: "title and description are required" });

  const PRIORITIES = ["low","medium","high","critical"];
  const p = PRIORITIES.includes(priority) ? priority : "medium";

  const ticket = ticketModel.create({
    title, description,
    status: "open",
    priority: p,
    category,
    createdBy: req.user.id,
    assignedTo: null,
    reopened: false,
    sla_due_at: slaModel.dueDateFor(p),
  });

  auditModel.log({ ticketId: ticket.id, actorId: req.user.id, actorName: req.user.name, action: "created", newValue: "open" });
  res.status(201).json(ticket);
};

const updateStatus = (req, res) => {
  const ticket = ticketModel.getById(req.params.id);
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });

  const { status } = req.body;
  const role = req.user.role;

  // admin can force-close from any state
  if (role === "admin" && status === "closed") {
    const updated = ticketModel.update(req.params.id, { status: "closed" });
    auditModel.log({ ticketId: ticket.id, actorId: req.user.id, actorName: req.user.name, action: "status_changed", oldValue: ticket.status, newValue: "closed" });
    return res.json(updated);
  }

  const allowed = FSM[role]?.[ticket.status];
  if (!allowed || allowed !== status)
    return res.status(400).json({ error: `Invalid transition: ${ticket.status} → ${status} for role ${role}` });

  const changes = { status };
  if (status === "open" && ticket.status === "resolved") changes.reopened = true;

  const updated = ticketModel.update(req.params.id, changes);
  auditModel.log({ ticketId: ticket.id, actorId: req.user.id, actorName: req.user.name, action: "status_changed", oldValue: ticket.status, newValue: status });
  res.json(updated);
};

const assign = (req, res) => {
  const ticket = ticketModel.getById(req.params.id);
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });

  const { assignedTo } = req.body;
  const updated = ticketModel.update(req.params.id, { assignedTo: assignedTo ?? req.user.id });
  auditModel.log({ ticketId: ticket.id, actorId: req.user.id, actorName: req.user.name, action: "assigned", oldValue: String(ticket.assignedTo), newValue: String(assignedTo ?? req.user.id) });
  res.json(updated);
};

const updatePriority = (req, res) => {
  const ticket = ticketModel.getById(req.params.id);
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });

  const PRIORITIES = ["low","medium","high","critical"];
  const { priority } = req.body;
  if (!PRIORITIES.includes(priority))
    return res.status(400).json({ error: `priority must be one of: ${PRIORITIES.join(", ")}` });

  const updated = ticketModel.update(req.params.id, { priority });
  auditModel.log({ ticketId: ticket.id, actorId: req.user.id, actorName: req.user.name, action: "priority_changed", oldValue: ticket.priority, newValue: priority });
  res.json(updated);
};

const remove = (req, res) => {
  const deleted = ticketModel.remove(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Ticket not found" });
  auditModel.log({ ticketId: parseInt(req.params.id), actorId: req.user.id, actorName: req.user.name, action: "deleted" });
  res.json({ message: "Ticket deleted", ticket: deleted });
};

const getStats = (req, res) => {
  const tickets = ticketModel.getAll();
  const now = new Date();
  res.json({
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in-progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    closed: tickets.filter((t) => t.status === "closed").length,
    slaBreached: tickets.filter((t) => t.sla_due_at && new Date(t.sla_due_at) < now && !["resolved","closed"].includes(t.status)).length,
    byPriority: ["low","medium","high","critical"].reduce((acc, p) => { acc[p] = tickets.filter((t) => t.priority === p).length; return acc; }, {}),
    agentWorkload: tickets.reduce((acc, t) => {
      if (t.assignedTo) { acc[t.assignedTo] = (acc[t.assignedTo] || 0) + 1; }
      return acc;
    }, {}),
  });
};

module.exports = { getAll, getMine, getById, create, updateStatus, assign, updatePriority, remove, getStats };
