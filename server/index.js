const express = require("express");
const cors    = require("cors");
const app     = express();
const PORT    = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth",    require("./routes/authRoutes"));
app.use("/api/tickets", require("./routes/ticketRoutes"));
app.use("/api/tickets/:id/comments", require("./routes/commentRoutes"));
app.use("/api/tickets/:id/notes",    require("./routes/noteRoutes"));
app.use("/api/users",  require("./routes/userRoutes"));
app.use("/api/audit",  require("./routes/auditRoutes"));
app.use("/api/sla",    require("./routes/slaRoutes"));

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
  console.log(`📋 Audit  → /api/audit`);
  console.log(`⏱  SLA    → /api/sla`);
});
