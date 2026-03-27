// ─── Ticket Model (in-memory) ─────────────────────────────────────────────────
let tickets = [
  {
    id: 1,
    title: "Login page not loading",
    description: "Users are unable to access the login page on mobile.",
    status: "open",
    priority: "high",
    category: "bug",
    createdBy: 3,       // customer user id
    assignedTo: null,
    reopened: false,
    sla_due_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date("2026-03-20T08:00:00Z").toISOString(),
    updatedAt: new Date("2026-03-20T08:00:00Z").toISOString(),
  },
  {
    id: 2,
    title: "Add dark mode support",
    description: "Implement a dark mode toggle across all pages.",
    status: "in-progress",
    priority: "medium",
    category: "feature",
    createdBy: 3,
    assignedTo: 2,      // agent user id
    reopened: false,
    sla_due_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date("2026-03-21T09:30:00Z").toISOString(),
    updatedAt: new Date("2026-03-22T11:00:00Z").toISOString(),
  },
  {
    id: 3,
    title: "Update API documentation",
    description: "Swagger docs are outdated for v2 endpoints.",
    status: "resolved",
    priority: "low",
    category: "task",
    createdBy: 3,
    assignedTo: 2,
    reopened: false,
    sla_due_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date("2026-03-18T07:00:00Z").toISOString(),
    updatedAt: new Date("2026-03-23T14:00:00Z").toISOString(),
  },
];

let nextId = 4;

const getAll = () => tickets;
const getById = (id) => tickets.find((t) => t.id === parseInt(id));
const getByUser = (userId) => tickets.filter((t) => t.createdBy === userId);

const create = (data) => {
  const ticket = { id: nextId++, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  tickets.push(ticket);
  return ticket;
};

const update = (id, changes) => {
  const idx = tickets.findIndex((t) => t.id === parseInt(id));
  if (idx === -1) return null;
  tickets[idx] = { ...tickets[idx], ...changes, updatedAt: new Date().toISOString() };
  return tickets[idx];
};

const remove = (id) => {
  const idx = tickets.findIndex((t) => t.id === parseInt(id));
  if (idx === -1) return null;
  return tickets.splice(idx, 1)[0];
};

module.exports = { getAll, getById, getByUser, create, update, remove };
