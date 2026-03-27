import { useEffect, useRef } from 'react';
import { useAuth } from '@/shared/context/AuthContext';
import { request } from '@/services/shared/api';

export const useLiveNotifications = (intervalMs = 20000) => {
  const { user } = useAuth();
  
  // Keep track of the latest update we have seen since mounting
  const lastUpdateRef = useRef(new Date().toISOString());
  
  useEffect(() => {
    // Only ask for permissions when the user is logged in and hasn't explicitly denied
    if (user && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    const poll = async () => {
      try {
        // Employees only care about their own tickets, Agents/Admins care about the global queue
        const endpoint = user.role === 'employee' ? '/tickets/mine?limit=5' : '/tickets?limit=5';
        const res = await request(endpoint);
        const tickets = res.tickets || [];
        
        if (tickets.length === 0) return;
        
        let newestDate = lastUpdateRef.current;
        const newTickets = [];
        
        // Find tickets that have been updated AFTER our last known timestamp
        tickets.forEach(ticket => {
          if (ticket.updatedAt > lastUpdateRef.current) {
            newTickets.push(ticket);
            if (ticket.updatedAt > newestDate) {
              newestDate = ticket.updatedAt;
            }
          }
        });
        
        // Update our mental model of "now" so we don't alert twice for the same update
        lastUpdateRef.current = newestDate;
        
        // Dispatch Native Notifications
        if (newTickets.length > 0 && "Notification" in window && Notification.permission === "granted") {
          newTickets.forEach(ticket => {
            const shortId = ticket.id ? ticket.id.substring(0, 6).toUpperCase() : 'SYS';
            let title = `Ticket Updated: #${shortId}`;
            let body = `Status changed to ${ticket.status.toUpperCase()}`;
            
            if (user.role === 'employee') {
                if (ticket.status === 'in-progress') title = `Agent Assigned: Ticket #${shortId}`;
                if (ticket.status === 'resolved') title = `Ticket Resolved! #${shortId}`;
            } else {
                if (ticket.status === 'open') {
                  title = `New Ticket Raised!`;
                  body = `Priority: ${ticket.priority.toUpperCase()} - Awaiting triage.`;
                }
            }
            
            try {
              const n = new Notification(title, { 
                body, 
                icon: '/vite.svg',
                silent: false 
              });
              
              // Auto close notification to avoid cluttering desktop
              setTimeout(() => n.close(), 7000);
            } catch (err) {
              // Mobile Safari sometimes throws if Notification isn't bound to user gesture
              console.error("Push Notification failed", err);
            }
          });
        }
      } catch (err) {
        // Silent catch for polling
      }
    };
    
    // Polling interval
    const timer = setInterval(poll, intervalMs);
    return () => clearInterval(timer);
  }, [user, intervalMs]);
};
