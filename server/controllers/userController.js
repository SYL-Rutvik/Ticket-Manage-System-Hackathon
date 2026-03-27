const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { sendCredentials } = require("../utils/emailService");

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAvailable: user.isAvailable,
      location: user.location,
      createdAt: user.createdAt,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getAll = async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash");
    const mappedUsers = users.map(u => ({
      id: u._id, name: u.name, email: u.email,
      role: u.role, isAvailable: u.isAvailable, location: u.location, createdAt: u.createdAt
    }));
    res.json({ count: users.length, users: mappedUsers });
  } catch (err) { res.status(500).json({ error: err.message }) }
};


const createUser = async (req, res) => {
  try {
    const { name, email, role, location } = req.body;
    if (!name || !email) return res.status(400).json({ error: "Name and email are required" });

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(409).json({ error: "Email already registered" });

    // Only allow employee and agent roles - admin cannot be created
    const VALID_ROLES = ["employee", "agent"];
    const userRole = VALID_ROLES.includes(role) ? role : "employee";

    // Generate random 8 character password
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let rawPassword = '';
    for (let i = 0; i < 8; i++) rawPassword += chars.charAt(Math.floor(Math.random() * chars.length));

    const user = new User({
      name,
      email: email.toLowerCase(),
      passwordHash: rawPassword,
      role: userRole,
      location: location || {}
    });
    await user.save(); // automatically hashed by pre-save hook

    // Dispatch email and return status so admin can take action if SMTP fails
    const emailSent = await sendCredentials(user.email, user.name, rawPassword);

    const response = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
      emailSent,
    };

    if (!emailSent) {
      response.warning = 'User was created, but email could not be sent from this machine.';
      if (process.env.NODE_ENV !== 'production') {
        response.tempPassword = rawPassword;
      }
    }

    res.status(201).json(response);
  } catch (err) { res.status(500).json({ error: err.message }) }
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
  } catch (err) { res.status(500).json({ error: err.message }) }
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
  } catch (err) { res.status(500).json({ error: err.message }) }
};

// Agent toggles their own Online / Offline status
const toggleAvailability = async (req, res) => {
  try {
    const agent = await User.findById(req.user.id);
    if (!agent) return res.status(404).json({ error: "User not found" });
    if (agent.role !== "agent") return res.status(400).json({ error: "Only agents can toggle availability" });

    agent.isAvailable = !agent.isAvailable;
    await agent.save();
    res.json({ id: agent._id, name: agent.name, role: agent.role, isAvailable: agent.isAvailable });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getAll, getMe, createUser, updateRole, remove, changePassword, toggleAvailability };
