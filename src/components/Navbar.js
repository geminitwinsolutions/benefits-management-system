import React from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function Navbar() {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="logo-icon">
          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
          <path d="M2 17l10 5 10-5"></path>
          <path d="M2 12l10 5 10-5"></path>
        </svg>
        <Link to="/">Premier Pride</Link>
      </div>

      <ul className="navbar-links">
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/employees">Employees</Link></li>
        <li><Link to="/central-hub/enrollment-management">Central Hub</Link></li>
        <li><Link to="/enrollment">Open Enrollment</Link></li>
        <li><Link to="/stats-reports">Reports</Link></li>
        
        {/* New Logout Button */}
        <li className="ml-auto">
          <button onClick={handleLogout} className="text-gray-200 hover:text-white px-4 py-2 transition duration-300 ease-in-out bg-transparent border border-gray-400 rounded-full hover:bg-gray-700">
            Log Out
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;