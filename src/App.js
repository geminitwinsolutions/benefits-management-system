// src/App.js
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase';

// Import Components
import Auth from './components/Auth';
import Navbar from './components/Navbar';

// Import Pages
import Dashboard from './pages/Dashboard';
import AllEmployees from './pages/AllEmployees';
import OpenEnrollment from './pages/OpenEnrollment';
import ClientDetails from './pages/ClientDetails';
import TierManagement from './pages/TierManagement';
import EnrollmentManagement from './pages/EnrollmentManagement';
import BenefitsReconciliation from './pages/BenefitsReconciliation';
import Communications from './pages/Communications';
import StatsAndReports from './pages/StatsAndReports';
import CentralHub from './pages/CentralHub';
import NotFound from './pages/NotFound';
import ServiceLibrary from './pages/ServiceLibrary';
import EmployeeSettings from './pages/EmployeeSettings';
import PlanManagement from './pages/PlanManagement';
import UserSettings from './pages/UserSettings';
import RoleManagement from './pages/RoleManagement'; // Import the new page

import './App.css';

// A wrapper component to protect routes
function ProtectedRoute({ session, children }) {
  if (!session) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// ===============================================
// === TEMPORARY AUTH BYPASS FOR DEVELOPMENT ===
// ===============================================
const BYPASS_AUTH = false;
// Set to 'false' to enable authentication and require login
// ===============================================

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <h1>Loading...</h1>
      </div>
    );
  }

  // Use the bypass for the root route logic
  if (BYPASS_AUTH) {
    return (
      <>
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employees" element={<AllEmployees />} />
          <Route path="/clients" element={<ClientDetails />} />
          <Route path="/reports" element={<StatsAndReports />} />
          <Route path="/communications" element={<Communications />} />
          <Route path="/central-hub" element={<CentralHub />}>
            <Route path="enrollment-management" element={<EnrollmentManagement />} />
            <Route path="open-enrollment" element={<OpenEnrollment />} />
            <Route path="tier-management" element={<TierManagement />} />
            <Route path="plan-management" element={<PlanManagement />} />
            <Route path="reconciliation" element={<BenefitsReconciliation />} />
            <Route path="service-library" element={<ServiceLibrary />} />
            <Route path="user-settings" element={<UserSettings />} />
            <Route path="role-management" element={<RoleManagement />} />
            <Route path="employee-settings" element={<EmployeeSettings />} />
            <Route index element={<Navigate to="enrollment-management" replace />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </>
    );
  }

  // Original authentication logic
  return (
    <>
      {session && <Navbar />}
      <Routes>
        <Route path="/" element={!session ? <Auth /> : <Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<ProtectedRoute session={session}><Dashboard /></ProtectedRoute>} />
        <Route path="/employees" element={<ProtectedRoute session={session}><AllEmployees /></ProtectedRoute>} />
        <Route path="/clients" element={<ProtectedRoute session={session}><ClientDetails /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute session={session}><StatsAndReports /></ProtectedRoute>} />
        <Route path="/communications" element={<ProtectedRoute session={session}><Communications /></ProtectedRoute>} />
        <Route path="/central-hub" element={<ProtectedRoute session={session}><CentralHub /></ProtectedRoute>}>
          <Route path="enrollment-management" element={<EnrollmentManagement />} />
          <Route path="open-enrollment" element={<OpenEnrollment />} />
          <Route path="tier-management" element={<TierManagement />} />
          <Route path="reconciliation" element={<BenefitsReconciliation />} />
          <Route path="service-library" element={<ServiceLibrary />} />
          <Route index element={<Navigate to="enrollment-management" replace />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;