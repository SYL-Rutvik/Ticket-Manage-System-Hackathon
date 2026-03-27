const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { sendCredentials } = require("../utils/emailService");

const getAll = async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash");
    const mappedUsers = users.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt }));
    res.json({ count: users.length, users: mappedUsers });
  } catch(err) { res.status(500).json({error: err.message}) }
};

const createUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    if (!name || !email) return res.status(400).json({ error: "Name and email are required" });

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(409).json({ error: "Email already registered" });

    // Only allow employee and agent roles - admin cannot be created
    const VALID_ROLES = ["employee", "agent"];
    const userRole = VALID_ROLES.includes(role) ? role : "employee";

    // Generate random 8 character password
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let rawPassword = '';
    for(let i=0; i<8; i++) rawPassword += chars.charAt(Math.floor(Math.random() * chars.length));

    const user = new User({ name, email: email.toLowerCase(), passwordHash: rawPassword, role: userRole });
    await user.save(); // automatically hashed by pre-save hook

    // Dispatch email
    await sendCredentials(user.email, user.name, rawPassword);

    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) { res.status(500).json({error: err.message}) }
};

const updateRole = async (req, res) => {
  try {
    // Only allow employee and agent roles - cannot change to admin
    const VALID_ROLES = ["employee", "agent"];
    const { role } = req.body;
    if (!VALID_ROLES.includes(role)) return res.status(400).json({ error: `role must be one of: ${VALID_ROLES.join(", ")}` });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    // Prevent changing admin to another role (admin is protected)
    if (user.role === "admin") return res.status(403).json({ error: "Cannot modify admin user role" });
    
    user.role = role;
    await user.save();
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch(err) { res.status(500).json({error: err.message}) }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: "Current and new password are required" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: "Incorrect current password" });

    if (newPassword.length < 6) return res.status(400).json({ error: "New password must be at least 6 characters" });

    user.passwordHash = newPassword; 
    await user.save(); // Model's pre-save hook handles hashing

    res.json({ message: "Password updated successfully" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const remove = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted" });
  } catch(err) { res.status(500).json({error: err.message}) }
};

module.exports = { getAll, createUser, updateRole, remove, changePassword };
