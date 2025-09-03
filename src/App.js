// src/App.js
import { useState, useEffect } from 'react';
// BrowserRouter as Router has been removed from this import
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase';
import Auth from './components/Auth';
import Dashboard from './pages/Dashboard';
import AllEmployees from './pages/AllEmployees';
import OpenEnrollment from './pages/OpenEnrollment';
import ClientDetails from './pages/ClientDetails';
import TierManagement from './pages/TierManagement';
import EnrollmentManagement from './pages/EnrollmentManagement';
import BenefitsReconciliation from './pages/BenefitsReconciliation';
import ServiceLibrary from './pages/ServiceLibrary';
import Communications from './pages/Communications';
import StatsAndReports from './pages/StatsAndReports';
import CentralHub from './pages/CentralHub';
import NotFound from './pages/NotFound';
import Navbar from './components/Navbar';
import './App.css';

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
    return <div>Loading...</div>; // Or a spinner component
  }

  return (
    // The <Router> component has been removed from here
    <>
      {session && <Navbar />}
      <div className="container">
        <Routes>
          <Route path="/" element={!session ? <Auth /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/employees" element={session ? <AllEmployees /> : <Navigate to="/" />} />
          <Route path="/open-enrollment" element={session ? <OpenEnrollment /> : <Navigate to="/" />} />
          <Route path="/client-details" element={session ? <ClientDetails /> : <Navigate to="/" />} />
          <Route path="/tier-management" element={session ? <TierManagement /> : <Navigate to="/" />} />
          <Route path="/enrollment-management" element={session ? <EnrollmentManagement /> : <Navigate to="/" />} />
          <Route path="/benefits-reconciliation" element={session ? <BenefitsReconciliation /> : <Navigate to="/" />} />
          <Route path="/service-library" element={session ? <ServiceLibrary /> : <Navigate to="/" />} />
          <Route path="/communications" element={session ? <Communications /> : <Navigate to="/" />} />
          <Route path="/stats-and-reports" element={session ? <StatsAndReports /> : <Navigate to="/" />} />
          <Route path="/central-hub" element={session ? <CentralHub /> : <Navigate to="/" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
}

export default App;