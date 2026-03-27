// ─── Note Model — internal agent/admin notes (hidden from customers) ──────────
let notes = [];
let nextId = 1;

const getByTicket = (ticketId) =>
  notes.filter((n) => n.ticketId === parseInt(ticketId));

const create = ({ ticketId, authorId, authorName, text }) => {
  const note = {
    id: nextId++,
    ticketId: parseInt(ticketId),
    authorId,
    authorName,
    text,
    createdAt: new Date().toISOString(),
  };
  notes.push(note);
  return note;
};

module.exports = { getByTicket, create };
