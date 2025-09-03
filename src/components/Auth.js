import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      alert('Check your email for the login link!');
    } catch (error) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ textAlign: 'center', maxWidth: '400px', margin: 'auto' }}>
      <h1>Welcome to Premier Pride</h1>
      <p>Sign in to your account below.</p>
      <form onSubmit={handleLogin} className="add-employee-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
          />
        </div>
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Sending link...' : 'Send Magic Link'}
        </button>
      </form>
    </div>
  );
}

export default Auth;
