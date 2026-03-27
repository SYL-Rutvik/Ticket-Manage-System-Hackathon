const slaModel = require("../models/slaModel");

const getConfig = (req, res) => {
  res.json(slaModel.getAll());
};

const updateConfig = (req, res) => {
  const { priority, hours } = req.body;
  const result = slaModel.update(priority, hours);
  if (!result) return res.status(400).json({ error: "Invalid priority" });
  res.json(result);
};

module.exports = { getConfig, updateConfig };
