const bcrypt = require("bcryptjs");

// ─── User Model (in-memory) ───────────────────────────────────────────────────
// Seed users — passwords are "password123"
const HASH = bcrypt.hashSync("password123", 10);

let users = [
  { id: 1, name: "Admin User",   email: "admin@example.com",  passwordHash: HASH, role: "admin"    },
  { id: 2, name: "Agent Alice",  email: "agent@example.com",  passwordHash: HASH, role: "agent"    },
  { id: 3, name: "Customer Bob", email: "customer@example.com", passwordHash: HASH, role: "customer" },
];

let nextId = 4;

const getAll = () => users.map(({ passwordHash, ...u }) => u);
const getById = (id) => users.find((u) => u.id === parseInt(id));
const getByEmail = (email) => users.find((u) => u.email.toLowerCase() === email.toLowerCase());

const create = ({ name, email, password, role = "customer" }) => {
  const passwordHash = bcrypt.hashSync(password, 10);
  const user = { id: nextId++, name, email: email.toLowerCase(), passwordHash, role };
  users.push(user);
  const { passwordHash: _, ...safe } = user;
  return safe;
};

const updateRole = (id, role) => {
  const user = users.find((u) => u.id === parseInt(id));
  if (!user) return null;
  user.role = role;
  const { passwordHash, ...safe } = user;
  return safe;
};

const remove = (id) => {
  const idx = users.findIndex((u) => u.id === parseInt(id));
  if (idx === -1) return null;
  return users.splice(idx, 1)[0];
};

module.exports = { getAll, getById, getByEmail, create, updateRole, remove };
