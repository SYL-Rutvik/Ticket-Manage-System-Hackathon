const commentModel = require("../models/commentModel");

const getByTicket = (req, res) => {
  const comments = commentModel.getByTicket(req.params.id);
  res.json({ count: comments.length, comments });
};

const create = (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "text is required" });

  const comment = commentModel.create({
    ticketId: req.params.id,
    authorId: req.user.id,
    authorName: req.user.name,
    text,
  });
  res.status(201).json(comment);
};

module.exports = { getByTicket, create };
