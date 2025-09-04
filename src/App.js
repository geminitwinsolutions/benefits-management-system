// src/App.js
import { useState } from 'react'; // 'useEffect' has been removed
import { Routes, Route, Navigate } from 'react-router-dom';
// 'supabase' import removed as it's not used in bypass mode

// Import Components
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

import './App.css';

// A wrapper component to protect routes
function ProtectedRoute({ session, children }) {
  if (!session) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  const [session] = useState(true); // <-- TEMPORARY BYPASS
  const [loading] = useState(false);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {session && <Navbar />}
      <div className="container">
        <Routes>
          {/* The root path will now always navigate to the dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute session={session}><Dashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/employees" 
            element={<ProtectedRoute session={session}><AllEmployees /></ProtectedRoute>} 
          />
          <Route 
            path="/stats-and-reports" 
            element={<ProtectedRoute session={session}><StatsAndReports /></ProtectedRoute>} 
          />

          <Route 
            path="/central-hub" 
            element={<ProtectedRoute session={session}><CentralHub /></ProtectedRoute>}
          >
            <Route index element={<Navigate to="enrollment-management" replace />} /> 
            <Route path="enrollment-management" element={<EnrollmentManagement />} />
            <Route path="enrollment-periods" element={<OpenEnrollment />} />
            <Route path="communications" element={<Communications />} />
            <Route path="reconciliation" element={<BenefitsReconciliation />} />
            <Route path="tier-management" element={<TierManagement />} />
            <Route path="client-details" element={<ClientDetails />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
}

export default App;