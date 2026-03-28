require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// ─── Middleware ───────────────────────────────────────────────────────────────
// CORS: Allow local development AND your primary Vercel/Production URL
app.use(cors({
  origin: process.env.FRONTEND_URL || true, // Defaults to all in dev, restricted in prod
  credentials: true
}));
app.use(express.json());


// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`📨 ${req.method} ${req.path}`);
  res.on('finish', () => {
    const duration = Date.now() - start;
    const icon = duration > 1000 ? '⏱️' : '✅';
    console.log(`${icon} ${req.method} ${req.path} - ${duration}ms (${res.statusCode})`);
  });
  next();
});

// Global request timeout (10 seconds)
app.use((req, res, next) => {
  req.setTimeout(10000, () => {
    console.error(`⏳ Timeout on ${req.method} ${req.path}`);
    res.status(504).json({ error: 'Request timeout' });
  });
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tickets", require("./routes/ticketRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/sla", require("./routes/slaRoutes"));

// ─── Health ───────────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ message: "🎫 Ticket Management API v2 (MVC)" }));

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server running → http://localhost:${PORT}`);
  console.log(`🔐 Auth   → POST /api/auth/register | /api/auth/login`);
  console.log(`🎫 Tickets → /api/tickets`);
  console.log(`👤 Users  → /api/users`);
  console.log(`⏱️  SLA    → /api/sla`);
});
