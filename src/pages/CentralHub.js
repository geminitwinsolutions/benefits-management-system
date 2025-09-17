// src/pages/CentralHub.js
import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { isSuperAdmin } from '../services/benefitService';

function CentralHub() {
    const [showAdminLinks, setShowAdminLinks] = useState(false);

    useEffect(() => {
        async function checkAdminStatus() {
            const superAdmin = await isSuperAdmin();
            setShowAdminLinks(superAdmin);
        }
        checkAdminStatus();
    }, []);

  return (
    <div className="page-container">
      <div className="central-hub-layout">
        <nav className="central-hub-sidebar">
          <h3>Management Hub</h3>

          {/* --- NEW CONSOLIDATED GROUP --- */}
          <div className="sidebar-group">
            <h4>Plan & Enrollment Hub</h4>
            <NavLink to="/central-hub/enrollment-management">Enrollment Dashboard</NavLink>
            <NavLink to="/central-hub/open-enrollment">Open Enrollment Periods</NavLink>
            <NavLink to="/central-hub/plan-management">Plan & Carrier Management</NavLink>
            <NavLink to="/central-hub/tier-management">Client Tier Management</NavLink>
            <NavLink to="/central-hub/reconciliation">Reconciliation</NavLink>
            <NavLink to="/central-hub/service-library">Service & Fee Library</NavLink>
          </div>

          {/* --- NEW RENAMED GROUP --- */}
          <div className="sidebar-group">
            <h4>System Settings</h4>
            <NavLink to="/central-hub/company-settings">Company Settings</NavLink>
            <NavLink to="/central-hub/employee-settings">Employee Settings</NavLink>
            <NavLink to="/central-hub/user-settings">User Management</NavLink>
            {showAdminLinks && (
                <NavLink to="/central-hub/role-management">Role Management</NavLink>
            )}
          </div>
        </nav>
        <div className="central-hub-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default CentralHub;