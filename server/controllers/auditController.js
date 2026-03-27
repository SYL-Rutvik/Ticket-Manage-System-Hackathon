const auditModel = require("../models/auditModel");

const getAll = (req, res) => {
  res.json({ logs: auditModel.getAll() });
};

const getByTicket = (req, res) => {
  res.json({ logs: auditModel.getByTicket(req.params.id) });
};

module.exports = { getAll, getByTicket };
