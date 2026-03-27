# 🎫 Ticket Management System (TicketFlow) — Hackathon Documentation

Welcome to the **TicketFlow** jury evaluation guide. This document provides a comprehensive overview of the project's architecture, modules, and component library.

---

## 🚀 Tech Stack

**Frontend:**
- **Framework:** React 19 (Vite)
- **Styling:** Tailwind CSS (Modern, Dark-mode first design)
- **Animations:** Framer Motion (Smooth transitions and micro-interactions)
- **Icons:** Lucide React
- **Routing:** React Router 7

**Backend:**
- **Runtime:** Node.js (MVC Architecture)
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose ODM)
- **Auth:** JWT (JSON Web Tokens) with Bcrypt password hashing
- **Middleware:** CORS, Express JSON, Error Handling, Request Loggers

---

## 🗺️ Project Modules

The application is architected into three primary modules, each tailored for a specific user persona:

### 1. Employee Module 🧑‍💼
Empowers employees to report issues and track their resolution journey.
- **My Tickets Dashboard:** Real-time list of all personal support requests.
- **Smart Ticket Creation:** An AI-inspired guided wizard that filters common problems and suggests self-help before creating a ticket (reduces IT workload).
- **Knowledge Base:** Centralized repository for common troubleshooting guides and FAQs.
- **Ticket Detail View:** Live ticket tracking with status updates and agent comments.

### 2. Agent Module 🕵️
Focused on triage, management, and resolution of organizational issues.
- **Global Ticket Queue:** Unified inbox for unassigned tickets.
- **Assignment System:** Intelligent claiming mechanism with availability checks.
- **Agent Dashboard:** Focused view of "My Assigned" tickets.
- **Availability Toggle:** Agents can go **Online/Offline**, disabling ticket assignment when unavailable.

### 3. Admin Module 🛡️
Advanced administrative controls for system governance.
- **Analytics Dashboard:** Visual representation of ticket volume, categories, and priority distribution.
- **User Management:** Full CRUD operations for system users and role assignments.
- **SLA Configuration:** Modify Service Level Agreement timings (Response/Resolution times) dynamically.

---

## 🛠️ Routing Architecture

The application uses **React Router** with a secure routing hierarchy.

### Public Routes
Used for authentication entry points.
- `/login` — User authentication.
- `/register` — Account creation (Defaults to `employee` role for security).

### Protected Routes & Layout
All internal routes are wrapped in a `ProtectedRoute` component that verifies JWT tokens and checks for authorized roles.
- **Sidebar Integration:** All internal pages use a persistent Sidebar for navigation.
- **Protected Layout:** A main layout wrapper (`AppLayout`) handles basic UI structure and Sidebar persistence.

| Module | Route Prefix | Primary Views |
|---|---|---|
| **Employee** | `/employee/*` | `tickets`, `tickets/create`, `tickets/:id`, `kb`, `profile` |
| **Agent** | `/agent/*` | `queue`, `assigned`, `tickets/:id` |
| **Admin** | `/admin/*` | `dashboard`, `users`, `sla` |

---

## 📂 Component & Module Breakdown

The project follows a modular structure where logic and UI are clearly separated.

### Core Components
- `Sidebar.jsx`: Unified navigation with role-based link filtering and Agent status toggle.
- `TicketCard.jsx`: Interactive card display with priority badges and metadata.
- `CommentSection.jsx`: Live activity stream for ticket updates and agent-employee communication.
- `Badge.jsx`: Reusable UI element for Status and Priority tags.
- `SLABadge.jsx`: Specialized timer component that calculates remaining time based on priority.
- `Modal.jsx`: Accessible overlay system for confirmations and quick edits.

### Shared Services & Hooks
- `useTickets.js`: Custom React hook that implements **Silent Polling** (updates data every 30s without flickering the UI).
- `api.js`: Centrally managed `axios`-style request wrapper with automatic auth header injection.

---

## ⭐ Feature Spotlight

### 🧠 Smart Guided Ticket Flow
Instead of a generic form, employees use a 4-step wizard:
1. **Category Selection:** 9 specific problem categories (Internet, Printer, Hardware, etc.).
2. **Sub-Questions:** Dynamic questions tailored to the category to gather precise metadata.
3. **Self-Help Gate:** Provides a checklist of "Quick Fixes". Only if these fail can a ticket be created.
4. **Auto-Prioritization:** Smart logic automatically sets `Priority` (Critical/High/Medium/Low) based on the business impact of the reported problem.

### 🟢 Agent Availability System
Agents now have a "Service Heartbeat":
- **Online:** Agent is active and can "Claim" tickets from the queue.
- **Offline:** The system visually dims the Agent's profile, hides "Claim" buttons, and the backend rejects assignment attempts.
- **Visual Feedback:** A green/gray status dot follows the agent throughout the UI.

---

## 📥 Getting Started

1. **Server Setup:**
   ```bash
   cd server
   npm install
   npm start
   ```
2. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

*The system is now live and ready for production evaluation.*
