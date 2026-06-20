import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login      from './pages/Login';
import Dashboard  from './pages/Dashboard';
import Analytics  from './pages/Analytics';
import Users      from './pages/Users';
import Tasks      from './pages/Tasks';
import {
  Withdrawals, Deposits, Transactions,
  Handbook, Broadcast, Team, Statements, Settings,
  Commissions
} from './pages/AdminPages';

function Guard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#F4F5F7' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontFamily:'Sora,sans-serif', fontSize:24, fontWeight:700, color:'#1D9E75', marginBottom:16 }}>GigWork Admin</div>
        <div style={{ width:28, height:28, border:'3px solid #E1F5EE', borderTopColor:'#1D9E75', borderRadius:'50%', animation:'spin .7s linear infinite', margin:'0 auto' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login"       element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/dashboard"   element={<Guard><Dashboard /></Guard>} />
      <Route path="/analytics"   element={<Guard><Analytics /></Guard>} />
      <Route path="/users"       element={<Guard><Users /></Guard>} />
      <Route path="/tasks"       element={<Guard><Tasks /></Guard>} />
      <Route path="/withdrawals" element={<Guard><Withdrawals /></Guard>} />
      <Route path="/deposits"    element={<Guard><Deposits /></Guard>} />
      <Route path="/transactions"element={<Guard><Transactions /></Guard>} />
      <Route path="/commissions" element={<Guard><Commissions /></Guard>} />
      <Route path="/handbook"    element={<Guard><Handbook /></Guard>} />
      <Route path="/broadcast"   element={<Guard><Broadcast /></Guard>} />
      <Route path="/team"        element={<Guard><Team /></Guard>} />
      <Route path="/statements"  element={<Guard><Statements /></Guard>} />
      <Route path="/settings"    element={<Guard><Settings /></Guard>} />
      <Route path="*"            element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
