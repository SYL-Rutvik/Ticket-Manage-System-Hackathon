# 🚀 TicketFlow — Feature Improvement Plan

> **Project:** Ticket Management System (Hackathon Edition)  
> **Stack:** React + Vite (Frontend) · Node.js + Express + MongoDB (Backend)  
> **Reviewed On:** 2026-03-27  

---

## 📌 Table of Contents

1. [Project Overview](#project-overview)
2. [Current Architecture Summary](#current-architecture-summary)
3. [🔴 Critical / High Priority Improvements](#-critical--high-priority-improvements)
4. [🟡 Medium Priority Improvements](#-medium-priority-improvements)
5. [🟢 Low Priority / Nice-to-Have](#-low-priority--nice-to-have)
6. [🖼️ UI/UX Polish](#-uiux-polish)
7. [🔧 Backend / API Improvements](#-backend--api-improvements)
8. [📊 Admin Dashboard Improvements](#-admin-dashboard-improvements)
9. [🔐 Security Improvements](#-security-improvements)
10. [📦 Code Quality & Maintainability](#-code-quality--maintainability)
11. [Feature-by-Feature Breakdown](#feature-by-feature-breakdown)
12. [Implementation Roadmap](#implementation-roadmap)

---

## Project Overview

**TicketFlow** is a role-based IT support ticket management system with three user roles:
- **Employee** — Submits tickets, tracks status, accesses KB, edits profile
- **Agent** — Views ticket queue, claims/assigns tickets, manages workflow transitions
- **Admin** — Full dashboard analytics, user management, SLA configuration

---

## Current Architecture Summary

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React + Vite + TailwindCSS | Lazy loading, Framer Motion animations |
| Routing | React Router v6 | Role-based protected routes |
| State / Data | Custom hooks + fetch() | No global state (Zustand/Redux) |
| Backend | Node.js + Express (MVC) | RESTful API |
| Database | MongoDB + Mongoose | Ticket & User models |
| Auth | JWT (7-day expiry) | Stored in AuthContext |
| SLA Tracking | In-memory config object | ⚠️ Not persisted to DB |
| Email | Nodemailer (sendCredentials) | Only used for new user provisioning |

---

## 🔴 Critical / High Priority Improvements

### 1. SLA Configuration — Persist to Database
**File:** `server/controllers/slaController.js`

**Problem:** SLA hours are stored in a plain JavaScript object (`let slaConfig = {...}`). Every time the server restarts, all SLA configuration changes are lost.

**Fix:** Create a `SLAConfig` Mongoose model and persist changes to MongoDB.

```js
// New file: server/models/slaConfigModel.js
const mongoose = require("mongoose");
const slaSchema = new mongoose.Schema({
  priority: { type: String, required: true, unique: true },
  hours: { type: Number, required: true }
});
module.exports = mongoose.model("SLAConfig", slaSchema);
```

---

### 2. Token Refresh Mechanism
**File:** `frontend/src/shared/context/AuthContext.jsx`

**Problem:** JWT tokens are set to expire in `7d` but there's no refresh logic. A user will abruptly get logged out mid-session with no warning.

**Fix:** 
- Add a `GET /api/auth/refresh` endpoint that issues a new token if the current one is still valid.
- On the frontend, check token expiry on app load and auto-refresh silently before expiry.

---

### 3. MyTickets — Add Filtering & Sorting
**File:** `frontend/src/views/employee/MyTickets.jsx`

**Problem:** The employee's ticket list (`MyTickets.jsx`) has **zero filtering or sorting controls**. An employee with many tickets has no way to find what they need quickly.

**Fix:** Add client-side or server-side filter controls:
- Filter by **Status** (open, in-progress, resolved, closed)
- Filter by **Priority**
- Sort by: **Date Created**, **SLA Due Date**, **Last Updated**
- Search by **title**

```jsx
// Add filter state above the ticket list
const [filterStatus, setFilterStatus] = useState('');
const [sortBy, setSortBy] = useState('createdAt');
```

---

### 4. Ticket Attachment Support
**File:** `server/models/ticketModel.js`, `frontend/src/views/employee/CreateTicket.jsx`

**Problem:** Employees cannot attach screenshots, logs, or any files to their tickets. This greatly limits the usefulness of the system.

**Fix:**
- Add `attachments: [{ filename, url, uploadedAt }]` to Ticket schema
- Use `multer` on the backend for file uploads
- Add a drag-and-drop or file input on the `CreateTicket` form

---

### 5. Agent Profile & Assigned Tickets Count Missing
**File:** `frontend/src/views/agent/MyAssigned.jsx`

**Problem:** The sidebar shows no ticket count badge for agents. The `MyAssigned` page exists, but agents have no way to see their "active load" at a glance.

**Fix:** Add a live count badge to the "My Assigned" sidebar link showing the number of open assigned tickets.

---

## 🟡 Medium Priority Improvements

### 6. Real-time Updates (Polling or WebSockets)
**File:** All ticket detail views

**Problem:** When an agent updates a ticket, the employee viewing that same ticket will never see the update unless they manually refresh the page.

**Fix Options:**
- **Quick Fix:** Add a polling interval (every 30s) in `useTickets.js` to re-fetch the current ticket.
- **Long-term Fix:** Integrate `socket.io` on both server and client for real-time push updates.

```js
// Simple polling example in useTickets hook
useEffect(() => {
  const interval = setInterval(() => fetchOne(id), 30000);
  return () => clearInterval(interval);
}, [id]);
```

---

### 7. Email Notifications on Ticket Events
**File:** `server/controllers/ticketController.js`, `server/utils/emailService.js`

**Problem:** The email service (`sendCredentials`) only sends an email when a new user is provisioned. There are no email notifications for:
- Ticket created confirmation (to employee)
- Ticket assigned (to agent)
- Ticket status changed (to employee who created it)
- SLA breach approaching (warning email)

**Fix:** Trigger `sendEmail()` calls inside `ticketController.js` after key actions (create, assign, updateStatus).

---

### 8. Knowledge Base — Dynamic Content from DB
**File:** `frontend/src/views/employee/KnowledgeBase.jsx`

**Problem:** All FAQ content is **hardcoded** as a static JavaScript array inside the component. No admin can add, edit, or remove KB articles without a code deployment.

**Fix:**
- Create a `KBArticle` Mongoose model (title, category, content)
- Add admin CRUD routes (`/api/kb`)
- Add an "Admin KB Editor" page under `/admin/kb`
- Fetch articles dynamically in `KnowledgeBase.jsx`

---

### 9. Pagination on Ticket Queue & Admin Table
**File:** `frontend/src/views/agent/TicketQueue.jsx`, `frontend/src/views/admin/Dashboard.jsx`

**Problem:** The backend supports `limit` and `skip` query params, but the frontend never uses them. With many tickets, all are loaded at once causing performance issues. The admin ticket table also only shows `tickets.slice(0, 10)` with no way to see more.

**Fix:**
- Add a `<Pagination />` component with prev/next controls
- Wire it to `limit` and `skip` query parameters on API calls
- Show "Showing X–Y of Z tickets"

---

### 10. Admin — Reassign Ticket to Specific Agent
**File:** `frontend/src/views/agent/TicketDetail.jsx`

**Problem:** The "Reassign" button in the admin's ticket detail view only reassigns the ticket **to the current admin user**, not to any available agent. It calls `assign(ticket.id, user.id)` regardless.

**Fix:** Show a dropdown of all agents fetched from `/api/users` filtered by `role=agent`, and let admin pick the right assignee.

---

### 11. Soft Delete for Tickets and Users
**File:** `server/controllers/ticketController.js`, `server/controllers/userController.js`

**Problem:** Current delete operations permanently remove records (`findByIdAndDelete`). This means audit history, reports, and comments are permanently gone.

**Fix:** Add a `deletedAt` (Date, default: null) field to both models and filter `deletedAt: null` in all queries. Expose an admin "restore" feature.

---

### 12. Dark Mode Toggle (Light Mode Option)
**File:** `frontend/src/index.css`, `frontend/src/App.jsx`

**Problem:** The entire app is hardcoded to dark mode. There's no way to switch to light mode for accessibility preferences.

**Fix:** Implement a CSS variable-based theme system with a toggle button stored in `localStorage`.

---

## 🟢 Low Priority / Nice-to-Have

### 13. Ticket Duplication Detection
**File:** `server/controllers/ticketController.js`

Before creating a new ticket, check if the same employee has a recently opened ticket with a similar title using a simple fuzzy match or MongoDB text index, and warn them to avoid duplicate submissions.

---

### 14. Bulk Actions for Admin
**File:** `frontend/src/views/admin/Dashboard.jsx`

Allow the admin to select multiple tickets via checkboxes and perform bulk actions:
- Bulk close
- Bulk assign to agent
- Bulk export to CSV

---

### 15. CSV / PDF Export
**File:** `frontend/src/views/admin/Dashboard.jsx`

Add an "Export Report" button that generates a CSV of the ticket data currently in view. Libraries: `papaparse` (CSV) or `jsPDF` (PDF).

---

### 16. Employee Ticket Rating / Feedback
**File:** `frontend/src/views/employee/TicketDetail.jsx`

After a ticket reaches "resolved" status, prompt the employee to rate the resolution (1–5 stars + optional comment). Store ratings in the ticket model:

```js
resolution: {
  rating: { type: Number, min: 1, max: 5 },
  feedback: { type: String },
  ratedAt: { type: Date }
}
```

---

### 17. Agent Availability Status
**File:** `server/models/userModel.js`

Add an `isAvailable: Boolean` field to the user model. Agents can toggle their availability status from the sidebar. The ticket queue can use this to show available agents and auto-suggest assignment.

---

### 18. Notification Bell (In-App)
**File:** `frontend/src/components/shared/Sidebar.jsx`

Add a notification bell icon in the sidebar/top bar. Clicking it opens a dropdown of recent events (e.g., "Your ticket #abc was resolved", "New ticket assigned to you"). Store notifications in a `Notification` model.

---

## 🖼️ UI/UX Polish

### 19. Ticket Status Color in Sidebar Badge
**File:** `frontend/src/components/shared/Sidebar.jsx`

The "My Tickets" link has no badge count. Add a live count badge showing open tickets so employees instantly know their pending work.

---

### 20. SLA Time Remaining Countdown
**File:** `frontend/src/components/shared/SLABadge.jsx`

Instead of just showing "Overdue" or "On Track", show a live countdown like: `"Due in 3h 22m"` or `"Overdue by 2h"` using a dynamic timer that updates every minute.

---

### 21. Empty State Improvements for Agent

The agent queue shows a generic "Queue is empty" message. Improve it with an encouraging message and a quick-tip, e.g., "🎉 All clear! No pending tickets right now."

---

### 22. Keyboard Shortcut Support
Add keyboard shortcuts for power users:
- `N` → New Ticket (employee)
- `Esc` → Close modal
- `Ctrl + /` → Open Knowledge Base search

---

### 23. Ticket Timeline Visual (Agent/Employee Detail)
**File:** `frontend/src/views/agent/TicketDetail.jsx`

Replace the current text-based audit log with a visual vertical timeline (currently partially implemented). Add color-coded nodes per action type:
- 🟢 Created
- 🔵 Assigned
- 🟡 Status Changed
- 🔴 Priority Escalated

---

## 🔧 Backend / API Improvements

### 24. Input Validation with Joi / Zod
**File:** All controllers

**Problem:** Validation is scattered and inconsistent (e.g., `if (!title || !description)`). Edge cases slip through easily.

**Fix:** Introduce `joi` or `zod` schemas for all request bodies and validate at the route/middleware level.

---

### 25. Rate Limiting
**File:** `server/index.js`

**Problem:** The API has no rate limiting. A malicious user or poorly-coded frontend loop could spam the API.

**Fix:** Use `express-rate-limit`:
```js
const rateLimit = require('express-rate-limit');
app.use('/api/', rateLimit({ windowMs: 60000, max: 100 }));
```

---

### 26. Global Error Handler Middleware
**File:** `server/index.js`

**Problem:** Every controller duplicates `catch(err) { res.status(500).json({error: err.message}) }`. 

**Fix:** Create a centralized error handler middleware and use `next(err)` in controllers.

---

### 27. Helmet.js for Security Headers
**File:** `server/index.js`

Add `helmet` middleware to set secure HTTP headers automatically:
```js
const helmet = require('helmet');
app.use(helmet());
```

---

### 28. CORS Restriction to Known Origins
**File:** `server/index.js`

**Problem:** `app.use(cors())` allows any origin. In production this is a security risk.

**Fix:**
```js
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173' }));
```

---

### 29. API Response Envelope Standardization
**Problem:** Responses are inconsistent — some return arrays, some return `{ count, tickets }`, some return objects directly.

**Fix:** Standardize a response envelope:
```js
// Success
{ success: true, data: {...}, message: "OK" }
// Error
{ success: false, error: "...", code: 400 }
```

---

## 📊 Admin Dashboard Improvements

### 30. Add Agent Workload to Stats API
**File:** `server/controllers/ticketController.js` → `getStats`

**Problem:** The admin dashboard shows "Agent Task Distribution" but `stats.agentWorkload` is never populated — the `getStats` function does not compute it. The UI shows "No active assignments" always.

**Fix:** Add this aggregation to `getStats`:
```js
const agentWorkload = await Ticket.aggregate([
  { $match: { assignedTo: { $ne: null }, status: { $nin: ['resolved','closed'] } } },
  { $group: { _id: '$assignedTo', count: { $sum: 1 } } }
]);
```

---

### 31. Time-Series Chart for Tickets Created Per Day
**File:** `frontend/src/views/admin/Dashboard.jsx`

Add a line/bar chart showing ticket creation trends over the past 7 or 30 days. Use `recharts` or `chart.js` for rendering.

---

### 32. Category Breakdown in Stats
**File:** `server/controllers/ticketController.js`

Add a `byCategory` aggregation to `getStats` and display it as a pie or donut chart in the admin dashboard.

---

## 🔐 Security Improvements

### 33. Password Strength Validation on Registration
**File:** `frontend/src/views/shared/Register.jsx`, `server/controllers/authController.js`

**Problem:** No password strength requirements are enforced during registration. A password of `"a"` is accepted.

**Fix:**
- Frontend: Show a live password strength meter
- Backend: Reject passwords shorter than 8 characters or that don't contain at least one number

---

### 34. JWT Secret Validation on Startup
**File:** `server/middleware/authMiddleware.js`

If `JWT_SECRET` is missing or defaults to an insecure value, the server should refuse to start:
```js
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('❌ JWT_SECRET must be at least 32 characters!');
  process.exit(1);
}
```

---

### 35. Role Escalation Protection on Registration
**File:** `server/controllers/authController.js`

**Problem:** The public `/api/auth/register` endpoint accepts a `role` field. Anyone can register as an `admin` by simply passing `{ role: "admin" }`.

**Fix:** Force all self-registrations to `role: "employee"` regardless of the payload. Only admins should be able to provision agents via `/api/users`.

```js
// authController.js - register
const user = new User({ name, email: email.toLowerCase(), passwordHash: password, role: "employee" });
//                                                                                  ^^^^^^^^^^^^^^^^^^^^
// Always employee. Admins are created by seeding or via /api/users.
```

---

## 📦 Code Quality & Maintainability

### 36. Centralize API Base URL
**File:** `frontend/src/views/employee/Profile.jsx` and all service files

**Problem:** `Profile.jsx` hardcodes `http://localhost:5000/api/...`. Service files in `/services/` also have `BASE_URL` scattered.

**Fix:** Create a single `frontend/src/config.js`:
```js
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

---

### 37. Add PropTypes or TypeScript
**File:** All `.jsx` components

Components like `TicketCard`, `Badge`, `CommentSection` pass props with no type validation. Add PropTypes or migrate to TypeScript for better DX and fewer runtime bugs.

---

### 38. Environment Variable Validation
**File:** `server/.env`

Add a startup check or use `envalid`/`zod` to validate that all required environment variables (`MONGO_URI`, `JWT_SECRET`, `PORT`) are present before the server starts.

---

### 39. Unit Tests
**Missing entirely**

Add unit tests for:
- Ticket FSM transitions (`getAllowedTransitions`)
- SLA calculation logic
- Auth controller (register/login)
- React component rendering with React Testing Library

**Tools:** `vitest` (frontend) + `jest` + `supertest` (backend)

---

### 40. Swagger / OpenAPI Documentation
**File:** `server/index.js`

Auto-generate API docs using `swagger-jsdoc` + `swagger-ui-express`. With `@swagger` JSDoc comments on routes, this gives a live, interactive API explorer at `/api/docs`.

---

## Feature-by-Feature Breakdown

| Feature | Current State | Improvement |
|---|---|---|
| **Employee — My Tickets** | Lists all, no filters | Add status/priority filter + sort |
| **Employee — Create Ticket** | Template-based form | Add file attachment support |
| **Employee — KB** | Static hardcoded FAQs | Dynamic DB-backed articles + admin editor |
| **Employee — Profile** | Password change only | Add name/avatar edit, notification prefs |
| **Agent — Ticket Queue** | Filters, no pagination | Add pagination + total count |
| **Agent — My Assigned** | Basic list | Add ticket count badge in sidebar |
| **Agent — Ticket Detail** | FSM actions, comments | Add real-time refresh, internal note improvements |
| **Admin — Dashboard** | KPI cards + static charts | Fix agentWorkload, add time-series chart, export |
| **Admin — User Mgmt** | CRUD users, role change | Add search/filter, last active date |
| **Admin — SLA Config** | In-memory only | Persist to MongoDB |
| **Auth — Register** | Accepts any role 🚨 | Force employee role on self-registration |
| **Notifications** | None | In-app bell + email on key events |
| **Real-time** | Static polling | Socket.io or polling fallback |

---

## Implementation Roadmap

### Phase 1 — Critical Fixes (Week 1)
- [ ] Fix role escalation vulnerability in `/api/auth/register`
- [ ] Persist SLA config to MongoDB
- [ ] Fix missing `agentWorkload` in `getStats` API
- [ ] Add `helmet` + rate limiting to server
- [ ] Centralize API base URL in frontend

### Phase 2 — Core Feature Enhancements (Week 2)
- [ ] Employee: Add filtering/sorting to `MyTickets`
- [ ] Admin: Fix "Reassign" to show agent dropdown
- [ ] KnowledgeBase: Make dynamic via admin editor
- [ ] Pagination on ticket queue and admin table
- [ ] Email notifications on ticket create / assign / status change

### Phase 3 — New Features (Week 3-4)
- [ ] File attachment support on tickets
- [ ] Ticket resolution rating system
- [ ] In-app notification bell
- [ ] Real-time ticket updates (polling → socket.io)
- [ ] Time-series chart on admin dashboard
- [ ] Soft delete for tickets and users

### Phase 4 — Quality & Polish (Ongoing)
- [ ] Unit + integration tests
- [ ] Swagger API docs
- [ ] TypeScript migration
- [ ] Light mode toggle
- [ ] Password strength meter
- [ ] SLA countdown timer in `SLABadge`

---

> 💡 **Tip:** Start with the Critical Fixes in Phase 1 — especially fixing the role escalation bug (Issue #35) and persisting SLA config (Issue #1). These are security and data-integrity issues that can cause real problems in production.
