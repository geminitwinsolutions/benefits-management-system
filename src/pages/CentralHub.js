import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

function CentralHub() {
  return (
    <div className="page-container">
      <div className="central-hub-layout">
        <nav className="central-hub-sidebar">
          <h3>Management Hub</h3>
          <NavLink to="/central-hub/enrollment-management">Enrollment Management</NavLink>
          <NavLink to="/central-hub/reconciliation">Benefit Reconciliation</NavLink>
          <NavLink to="/central-hub/communications">Communications</NavLink>
          <hr/>
          <NavLink to="/central-hub/client-details">Client Details</NavLink>
          <NavLink to="/central-hub/tier-management">Tier Management</NavLink>
          <hr/>
          <NavLink to="/central-hub/enrollment-periods">Enrollment Periods</NavLink>
        </nav>
        <main className="central-hub-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default CentralHub;