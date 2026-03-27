# Ticket Manage System Hackathon

Full-stack ticket management system with role-based workflows for employee, agent, and admin users.

## Project Structure

- frontend/: React + Vite client application
- server/: Node.js + Express + MongoDB API server

## Features

- JWT authentication and role-based access control
- Employee ticket creation and tracking
- Agent queue, assignment, and status workflow handling
- Admin dashboard, user management, and SLA configuration
- Comments, internal notes, and activity log support

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: JSON Web Token (JWT)

## Prerequisites

Install these tools before running the project:

- Node.js 18+ (recommended: latest LTS)
- npm 9+ (comes with Node.js)
- MongoDB Atlas cluster or local MongoDB instance
- Git

Verify installation:

```bash
node -v
npm -v
git --version
```

## Clone and Setup

1. Clone repository

```bash
git clone https://github.com/SYL-Rutvik/Ticket-Manage-System-Hackathon.git
cd Ticket-Manage-System-Hackathon
```

2. Install frontend dependencies

```bash
cd frontend
npm install
```

3. Install server dependencies

```bash
cd ../server
npm install
```

## Environment Configuration

Create a .env file inside server/ folder.

Example:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
PORT=5000
```

Notes:

- MONGO_URI must point to a working MongoDB database.
- PORT defaults to 5000 in this project.
- Keep .env private and never commit secrets.

## Run the Project

Open two terminals from project root.

Terminal 1: start backend

```bash
cd server
npm start
```

Terminal 2: start frontend

```bash
cd frontend
npm run dev
```

Application URLs:

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Available Scripts

Frontend (inside frontend/):

- npm run dev: start Vite development server
- npm run build: create production build
- npm run preview: preview production build locally
- npm run lint: run ESLint

Backend (inside server/):

- npm start: start API server with nodemon
- npm test: placeholder script

## Dependency List

Frontend dependencies:

- framer-motion
- lucide-react
- react
- react-dom
- react-router-dom

Frontend dev dependencies:

- @eslint/js
- @types/react
- @types/react-dom
- @vitejs/plugin-react
- autoprefixer
- eslint
- eslint-plugin-react-hooks
- eslint-plugin-react-refresh
- globals
- postcss
- tailwindcss
- vite

Server dependencies:

- bcryptjs
- cors
- dotenv
- express
- jsonwebtoken
- mongodb
- mongoose
- nodemon

## First-Run Checklist

If someone clones the project for the first time, they should do this in order:

1. Clone repo
2. Install frontend dependencies
3. Install server dependencies
4. Create server/.env
5. Start backend server
6. Start frontend app
7. Open http://localhost:5173

## Common Issues and Fixes

1. npm run dev or npm start fails with missing module errors

- Run npm install in both frontend/ and server/.

2. Backend starts but database connection fails

- Recheck MONGO_URI in server/.env.
- Confirm MongoDB network access and credentials.

3. Frontend loads but API calls fail

- Confirm backend is running on http://localhost:5000.
- Check token and login flow.

4. Port already in use

- Stop existing process on that port or change PORT in server/.env.

## Contributing

1. Create a feature branch.
2. Make changes and test locally.
3. Commit with clear messages.
4. Push branch and open a pull request.
