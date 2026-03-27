# TicketFlow - Evaluation Progress Report & Phase 2 Roadmap

## Part 1: Completed Pre-Evaluation (What we did so far)
This section outlines the foundation and core workflows evaluated in Phase 1.

### 1. Robust Role-Based Access Control (RBAC)
- Built a secure architecture isolating 3 distinct roles: **Employee**, **Agent**, and **Admin**.
- Implemented JWT-based authentication tied directly to server-side middleware `requireRole()`, ensuring APIs cannot be bypassed.
- Added encrypted passwords using `bcryptjs`.

### 2. Smart Problem Tree & Self-Resolution Deflection
- Developed an intelligent ticket creation wizard using a tree-based decision algorithm.
- Identifies the root cause dynamically and forces users to review specific "Self-Help" checks before submitting a ticket.
- **Business Value:** Radically decreases meaningless Tier-1 helpdesk tickets.

### 3. Automated User Provisioning
- Admins provision user accounts securely from the dashboard.
- The system automatically generates a randomized 8-character password and dispatches it directly to the user's email via `Nodemailer`.
- Seamless fallback architecture prevents application crashes if email SMTP fails.

### 4. Live Polling Global Queue
- Built a highly reactive dashboard using React + Tailwind CSS with Framer Motion.
- Agents view a real-time, auto-syncing (30s polling) global queue, ensuring multiple agents don't step on each other's toes when claiming tickets.

---

## Part 2: Post-Evaluation Upgrades (Phase 2 Roadmap)
Based on evaluator feedback regarding scalability, data integrity, and communication, the following optimizations and features are scheduled for implementation.

### Q&A 1: How do we acknowledge users about ticket states?
**Plan: Multi-channel Notification System**
- **Actionable update:** Implement an automated `Nodemailer` hook that triggers an email dispatch whenever a ticket is structurally updated (Created, Assigned, Resolved, Reopened). 
- **Actionable update:** Add a real-time `Event History` timeline inside the `TicketDetail` view so the employee sees an exact timestamped log of agent interactions.

### Q&A 2: Scalability - 50 Agents, 100 Requests. How to assign?
**Plan: Intelligent Round-Robin Assignment Algorithm**
- **Actionable update:** Implement a smart auto-assignment algorithm on the backend. When a new ticket is raised, the `server` will query the database for all Agents where `isAvailable: true`, count how many `open` or `in-progress` tickets each currently holds, and assign the ticket to the agent with the **lowest utilized capacity**. 
- *Scalability note:* By checking `agent.isAvailable` (the status toggle we built), we prevent assigning crticial issues to agents who went home for the day.

### Q&A 3 & 4: Adding Location (City, State, Area) & Normalization
**Plan: NoSQL Database Optimization (Mongoose/MongoDB)**
- **Model Update:** We will embed an `address` subdocument into the Customer (Employee) account creation, tracking `city`, `state`, and `area`.
- **Database Normalization Logic:** In a NoSQL database like MongoDB, strict relational normalization (3NF) is actually an anti-pattern because it causes too many `JOIN` operations ($lookup). Since a user's `city` rarely changes, we use **Document Embedding** instead of referencing. This allows the server to load a User and their Location in a single, blazing-fast read operation (O(1) time complexity) rather than querying multiple tables.
- **Actionable update:** Update the Admin "Add Employee" form to accept these fields, update the backend Validation schemas, and display the location on the `TicketDetail` page so agents know where to dispatch physical hardware repairs.

---

## Technical Action Plan for Immediate Development
1. **Database Mod**: Update `models/userModel.js` and `models/ticketModel.js` to support geographic location fields.
2. **Backend Services**: Build the Auto-Assignment Algorithm in the `POST /tickets` route, replacing manual claims for an automated load-balancer.
3. **Frontend Mod**: Update Admin `CustomerManagement` to take City/State during creation.
4. **Email Mod**: Hook `emailService.js` into the `changeStatus` socket logic to alert users automatically.
