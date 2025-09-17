// src/App.js
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
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
import RoleManagement from './pages/RoleManagement';
import CompanySettings from './pages/CompanySettings';

import './App.css';

// A layout component for authenticated users
// This ensures the Navbar is always present on protected pages.
const AppLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);


function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for an active session on initial load
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getSession();

    // Listen for changes in authentication state (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Clean up the subscription when the component unmounts
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/*"
        element={
          session ? (
            <AppLayout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        {/* All authenticated routes are nested here */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="employees" element={<AllEmployees />} />
        <Route path="clients" element={<ClientDetails />} />
        <Route path="reports" element={<StatsAndReports />} />
        <Route path="communications" element={<Communications />} />

        <Route path="central-hub/*" element={<CentralHub />}>
          <Route path="enrollment-management" element={<EnrollmentManagement />} />
          <Route path="open-enrollment" element={<OpenEnrollment />} />
          <Route path="tier-management" element={<TierManagement />} />
          <Route path="plan-management" element={<PlanManagement />} />
          <Route path="reconciliation" element={<BenefitsReconciliation />} />
          <Route path="service-library" element={<ServiceLibrary />} />
          <Route path="user-settings" element={<UserSettings />} />
          <Route path="role-management" element={<RoleManagement />} />
          <Route path="company-settings" element={<CompanySettings />} />
          <Route path="employee-settings" element={<EmployeeSettings />} />
          <Route index element={<Navigate to="enrollment-management" replace />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route
        path="/login"
        element={!session ? <Auth /> : <Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
}

export default App;