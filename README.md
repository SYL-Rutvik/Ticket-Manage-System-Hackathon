# Ticket Manage System Hackathon

A full-stack ticket management system with role-based workflows for employees, agents, and admins.

## Project Structure

- `frontend/` - React + Vite client application
- `server/` - Node.js + Express API server

## Features

- JWT authentication and role-based access control
- Employee ticket creation and tracking
- Agent ticket queue, assignment, and status workflows
- Admin dashboard, user management, and SLA configuration
- Comments, internal notes, and activity log support

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express, MongoDB (Mongoose)
- Auth: JSON Web Tokens (JWT)

## Getting Started

### 1. Install dependencies

```bash
cd frontend && npm install
cd ../server && npm install
```

### 2. Configure environment

Create a `.env` file in `server/` with required values, for example:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

### 3. Run the app

Start backend:

```bash
cd server
npm start
```

Start frontend (in a new terminal):

```bash
cd frontend
npm run dev
```

Frontend runs at `http://localhost:5173` and backend at `http://localhost:5000`.
