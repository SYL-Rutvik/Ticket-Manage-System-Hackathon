const userModel = require("../models/userModel");

const getAll = (req, res) => {
  res.json({ count: userModel.getAll().length, users: userModel.getAll() });
};

const updateRole = (req, res) => {
  const VALID_ROLES = ["customer", "agent", "admin"];
  const { role } = req.body;
  if (!VALID_ROLES.includes(role))
    return res.status(400).json({ error: `role must be one of: ${VALID_ROLES.join(", ")}` });

  const user = userModel.updateRole(req.params.id, role);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
};

const remove = (req, res) => {
  const deleted = userModel.remove(req.params.id);
  if (!deleted) return res.status(404).json({ error: "User not found" });
  res.json({ message: "User deleted" });
};

module.exports = { getAll, updateRole, remove };
