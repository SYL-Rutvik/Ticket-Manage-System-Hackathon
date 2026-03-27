# 📍 Location-Based Smart Ticket Routing

## 💡 Overview
Based on the judge's feedback, we have implemented a **Location-Aware Assignment System**. This system ensures that support requests are routed to agents who are physically located in the same city or area. 

This is particularly useful for hardware or connectivity issues (like internet outages on a specific floor) where a single local agent can claim and resolve multiple nearby requests efficiently.

---

## 🏗️ Technical Implementation

### 1. Model Enhancements
Both the **User** and **Ticket** models have been updated to include a `city` field.
- **User Model:** Stores the agent's or employee's registered work location (e.g., "Surat", "Mumbai").
- **Ticket Model:** Stores the location of the incident, ensuring it follows the employee who reported it.

### 2. Automatic Routing Logic
The routing is handled automatically at the database level:
- **Employee Experience:** When an employee creates a ticket, the system automatically detects their registered city and tags the ticket with that location.
- **Agent Experience:** When an agent views the **Global Ticket Queue**, the backend automatically injects a filter. 
    - *The agent will only see tickets that match their own city.*
    - *Tickets from other cities are hidden to prevent clutter and ensure local resolution.*

### 3. Backend Enforcement (`ticketController.js`)
We modified the `getAll` controller to detect the role of the requester:
```javascript
// Server-side filtering logic
if (req.user.role === "agent") {
  query.city = req.user.city; // Force filter by agent's city
}
```

---

## ✅ Benefits
- **Zero Configuration:** Agents don't need to manually filter their queue; the system does it for them.
- **Improved SLA:** Local agents can move between desks/floors to solve multiple related issues in one trip.
- **Data Integrity:** Tickets are always tagged with a location, providing better analytics for regional office performance.

---

*This feature was implemented to resolve the specific hackathon requirement for localized resource management.*
