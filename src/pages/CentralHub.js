// src/pages/CentralHub.js
import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { isSuperAdmin } from '../services/benefitService';

function CentralHub() {
    const [showRoleManagement, setShowRoleManagement] = useState(false);

    useEffect(() => {
        async function checkAdminStatus() {
            const superAdmin = await isSuperAdmin();
            setShowRoleManagement(superAdmin);
        }
        checkAdminStatus();
    }, []);

  return (
    <div className="page-container">
      <div className="central-hub-layout">
        <nav className="central-hub-sidebar">
          <h3>Management Hub</h3>

          <div className="sidebar-group">
            <h4>Benefits</h4>
            <NavLink to="/central-hub/plan-management">Plan Management</NavLink>
            <NavLink to="/central-hub/tier-management">Tier Management</NavLink>
            <NavLink to="/central-hub/reconciliation">Reconciliation</NavLink>
          </div>

          <div className="sidebar-group">
            <h4>Enrollment</h4>
            <NavLink to="/central-hub/enrollment-management">Enrollment Dashboard</NavLink>
            <NavLink to="/central-hub/open-enrollment">Open Enrollment Periods</NavLink>
          </div>

          <div className="sidebar-group">
            <h4>Services</h4>
            <NavLink to="/central-hub/service-library">Service & Fee Library</NavLink>
          </div>
          <div className="sidebar-group">
            <h4>Admin</h4>
            <NavLink to="/central-hub/user-settings">User Settings</NavLink>
            {showRoleManagement && (
                <NavLink to="/central-hub/role-management">Role Management</NavLink>
            )}
            <NavLink to="/central-hub/company-settings">Company Settings</NavLink>
             <NavLink to="/central-hub/employee-settings">Employee Settings</NavLink>
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