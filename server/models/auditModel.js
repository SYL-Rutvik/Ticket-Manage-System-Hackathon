// ─── Audit Log Model ──────────────────────────────────────────────────────────
let logs = [];
let nextId = 1;

const getByTicket = (ticketId) =>
  logs.filter((l) => l.ticketId === parseInt(ticketId));

const getAll = () => [...logs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

const log = ({ ticketId, actorId, actorName, action, oldValue, newValue }) => {
  const entry = {
    id: nextId++,
    ticketId: parseInt(ticketId),
    actorId,
    actorName,
    action,
    oldValue: oldValue ?? null,
    newValue: newValue ?? null,
    createdAt: new Date().toISOString(),
  };
  logs.push(entry);
  return entry;
};

module.exports = { getByTicket, getAll, log };
