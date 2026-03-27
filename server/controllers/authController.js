const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const { JWT_SECRET } = require("../middleware/authMiddleware");

const register = (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "name, email and password are required" });

  if (userModel.getByEmail(email))
    return res.status(409).json({ error: "Email already registered" });

  const VALID_ROLES = ["customer", "agent", "admin"];
  const user = userModel.create({
    name, email, password,
    role: VALID_ROLES.includes(role) ? role : "customer",
  });

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
  res.status(201).json({ token, user });
};

const login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "email and password are required" });

  const user = userModel.getByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash))
    return res.status(401).json({ error: "Invalid credentials" });

  const { passwordHash, ...safe } = user;
  const token = jwt.sign({ id: safe.id, name: safe.name, email: safe.email, role: safe.role }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: safe });
};

module.exports = { register, login };
