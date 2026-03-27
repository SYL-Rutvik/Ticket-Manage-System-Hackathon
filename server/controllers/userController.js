const User = require("../models/userModel");

const getAll = async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash");
    res.json({ count: users.length, users });
  } catch(err) { res.status(500).json({error: err.message}) }
};

const updateRole = async (req, res) => {
  try {
    const VALID_ROLES = ["employee", "agent", "admin"];
    const { role } = req.body;
    if (!VALID_ROLES.includes(role)) return res.status(400).json({ error: `role must be one of: ${VALID_ROLES.join(", ")}` });

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch(err) { res.status(500).json({error: err.message}) }
};

const remove = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted" });
  } catch(err) { res.status(500).json({error: err.message}) }
};

module.exports = { getAll, updateRole, remove };
