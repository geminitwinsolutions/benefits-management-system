import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

function CentralHub() {
  return (
    <div className="page-container">
      <div className="central-hub-layout">
        <nav className="central-hub-sidebar">
          <h3>Management Hub</h3>

          <div className="sidebar-group">
            <h4>Enrollment</h4>
            <NavLink to="/central-hub/enrollment-management">Dashboard</NavLink>
            <NavLink to="/central-hub/enrollment-periods">Enrollment Periods</NavLink>
            <NavLink to="/central-hub/communications">Communications</NavLink>
          </div>

          <div className="sidebar-group">
            <h4>Benefits</h4>
            <NavLink to="/central-hub/reconciliation">Reconciliation</NavLink>
            <NavLink to="/central-hub/tier-management">Tier Management</NavLink>
          </div>

          <div className="sidebar-group">
            <h4>Client Admin</h4>
            <NavLink to="/central-hub/client-details">Client Details</NavLink>
          </div>
        </nav>
        <main className="central-hub-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default CentralHub;