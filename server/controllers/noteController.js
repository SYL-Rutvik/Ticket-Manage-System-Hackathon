const noteModel = require("../models/noteModel");

const getByTicket = (req, res) => {
  const notes = noteModel.getByTicket(req.params.id);
  res.json({ count: notes.length, notes });
};

const create = (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "text is required" });

  const note = noteModel.create({
    ticketId: req.params.id,
    authorId: req.user.id,
    authorName: req.user.name,
    text,
  });
  res.status(201).json(note);
};

module.exports = { getByTicket, create };
