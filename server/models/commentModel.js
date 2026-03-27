// ─── Comment Model — customer-visible replies ─────────────────────────────────
let comments = [];
let nextId = 1;

const getByTicket = (ticketId) =>
  comments.filter((c) => c.ticketId === parseInt(ticketId));

const create = ({ ticketId, authorId, authorName, text }) => {
  const comment = {
    id: nextId++,
    ticketId: parseInt(ticketId),
    authorId,
    authorName,
    text,
    createdAt: new Date().toISOString(),
  };
  comments.push(comment);
  return comment;
};

module.exports = { getByTicket, create };
