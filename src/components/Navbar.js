import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const Navbar = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate('/');
    } else {
      alert('Error signing out. Please try again.');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">
          <h1>Premier Pride Management System</h1>
          <span className="powered-by">powered by Alternative Solutions</span>
        </Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/central-hub">Central Hub</Link></li>
        <li><Link to="/clients">Clients</Link></li>
        <li><Link to="/employees">Employees</Link></li>
        <li><Link to="/communications">Communications</Link></li>
        <li><Link to="/reports">Reports</Link></li>
      </ul>
      <button onClick={handleSignOut} className="action-button">Log Out</button>
    </nav>
  );
};

export default Navbar;