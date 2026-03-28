# �️ Master Walkthrough: Vercel (Frontend) + Render (Backend)

This is the most efficient configuration for a hackathon. Follow these exact steps to go live in under 15 minutes.

---

## 🏗️ Phase 1: Deploy the Backend (Render.com)

1.  **Login**: Go to [Render.com](https://render.com) and sign in with GitHub.
2.  **Create Service**: Click **New +** > **Web Service**.
3.  **Connect Repo**: Select your `Ticket-Manage-System-Hackathon` repository.
4.  **Configure**:
    *   **Name**: `ticketflow-api`
    *   **Region**: Select the one closest to you (e.g., Singapore or US East).
    *   **Branch**: `main`
    *   **Root Directory**: `server`
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
5.  **Environment Variables**: Click "Advanced" > "Add Environment Variable":
    *   `MONGO_URI`: (Your MongoDB Atlas connection string)
    *   `JWT_SECRET`: (Any long random string)
    *   `SMTP_USER`: `ticketfflow@gmail.com`
    *   `SMTP_PASS`: (Your 16-character App Password)
    *   `SMTP_SERVICE`: `gmail`
    *   `SMTP_FROM`: `"TicketFlow Portal" <ticketfflow@gmail.com>`
6.  **Deploy**: Click **Create Web Service**. 
7.  **🕒 Wait**: It will take 2-3 minutes to build. Once complete, copy the URL provided (e.g., `https://ticketflow-api.onrender.com`).

---

## 🎨 Phase 2: Deploy the Frontend (Vercel.com)

1.  **Login**: Go to [Vercel.com](https://vercel.com) and sign in with GitHub.
2.  **Add New**: Click **Add New...** > **Project**.
3.  **Import**: Click **Import** next to your `Ticket-Manage-System-Hackathon` repository.
4.  **Configure Project**:
    *   **Framework Preset**: `Vite` (Detects automatically)
    *   **Root Directory**: click **Edit** and select `frontend`.
5.  **Environment Variables**: Expand this section and add:
    *   **Key**: `VITE_API_URL`
    *   **Value**: (Paste your Render Backend URL from Phase 1) — *Example: `https://ticketflow-api.onrender.com`*
6.  **Deploy**: Click **Deploy**.
7.  **🕒 Wait**: It takes about 1 minute. Once done, you will get your live site URL!

---

## � Phase 3: The "CORS" Critical Fix

For security, the backend needs to know that your new Vercel URL is allowed to talk to it.

1.  Open `server/server.js` (or `app.js`).
2.  Find the `cors()` middleware.
3.  Update it to include your Vercel URL:
```javascript
app.use(cors({
  origin: ["http://localhost:5173", "https://your-frontend-name.vercel.app"],
  credentials: true
}));
```
4.  **Commit & Push** this change to GitHub. Render will automatically redeploy the backend with the fix.

---

## 🗄️ Phase 4: MongoDB Atlas Whitelisting

1.  Log in to **MongoDB Atlas**.
2.  Go to **Network Access** (under Security).
3.  Click **Add IP Address**.
4.  Select **Allow Access From Anywhere** (0.0.0.0/0). 
    *   *Note: This is required because Render and Vercel use dynamic IP addresses.*
5.  Click **Confirm**.

---

### ✅ Your Setup is Complete!
- **Frontend**: Managed by Vercel (Super fast UI)
- **Backend**: Managed by Render (Powerful Logic)
- **Database**: Managed by MongoDB Atlas (Secure Data)

**Go to your Vercel URL and try creating a ticket!** 🚀
