// src/components/Navbar.js
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
        <Link to="/dashboard">Premier Pride</Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/employees">Employees</Link></li>
        <li><Link to="/central-hub">Central Hub</Link></li>
        <li><Link to="/stats-and-reports">Reports</Link></li>
      </ul>
      <button onClick={handleSignOut} className="add-button" style={{ backgroundColor: '#dc3545' }}>
        Log Out
      </button>
    </nav>
  );
};

export default Navbar;