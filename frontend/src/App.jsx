import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from '@/shared/context/AuthContext';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import Sidebar from '@/components/shared/Sidebar';

// Loading Fallback Component
const PageSkeleton = () => (
  <div className="p-8 w-full h-full flex flex-col gap-6 animate-pulse">
    <div className="w-1/3 h-8 bg-elevated rounded-lg mb-4"></div>
    <div className="w-full h-32 bg-elevated rounded-xl"></div>
    <div className="w-full h-64 bg-elevated rounded-xl"></div>
  </div>
);

// Lazy Loaded Views
const Login = lazy(() => import('@/views/shared/Login'));
const Register = lazy(() => import('@/views/shared/Register'));

// Employee
const MyTickets = lazy(() => import('@/views/employee/MyTickets'));
const CreateTicket = lazy(() => import('@/views/employee/CreateTicket'));
const TicketDetailEmployee = lazy(() => import('@/views/employee/TicketDetail'));

// Agent
const TicketQueue = lazy(() => import('@/views/agent/TicketQueue'));
const MyAssigned = lazy(() => import('@/views/agent/MyAssigned'));
const TicketDetailAgent = lazy(() => import('@/views/agent/TicketDetail'));

// Admin
const Dashboard = lazy(() => import('@/views/admin/Dashboard'));
const UserManagement = lazy(() => import('@/views/admin/UserManagement'));
const SLAConfig = lazy(() => import('@/views/admin/SLAConfig'));

// Layout wrapper
const AppLayout = () => (
  <div className="app-layout">
    <Sidebar />
    <main className="main-content">
      <div className="max-w-6xl mx-auto w-full">
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </div>
    </main>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={
            <Suspense fallback={<div className="h-screen w-screen bg-base flex flex-col items-center justify-center space-y-4"><div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div><p className="text-gray-400 font-medium tracking-widest text-sm uppercase">Loading Application...</p></div>}>
              <Login />
            </Suspense>
          } />
          <Route path="/register" element={
            <Suspense fallback={<div className="h-screen w-screen bg-base flex flex-col items-center justify-center space-y-4"><div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div><p className="text-gray-400 font-medium tracking-widest text-sm uppercase">Loading Application...</p></div>}>
              <Register />
            </Suspense>
          } />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Employee Routes */}
          <Route path="/employee" element={<ProtectedRoute roles={['employee']}><AppLayout /></ProtectedRoute>}>
            <Route path="tickets" element={<MyTickets />} />
            <Route path="tickets/create" element={<CreateTicket />} />
            <Route path="tickets/:id" element={<TicketDetailEmployee />} />
          </Route>

          {/* Agent Routes */}
          <Route path="/agent" element={<ProtectedRoute roles={['agent', 'admin']}><AppLayout /></ProtectedRoute>}>
            <Route path="queue" element={<TicketQueue />} />
            <Route path="assigned" element={<MyAssigned />} />
            <Route path="tickets/:id" element={<TicketDetailAgent />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AppLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="sla" element={<SLAConfig />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
