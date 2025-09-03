import { useState } from 'react';
import { supabase } from '../supabase';
// import styles from './Auth.module.css'; // Removed this line

const Auth = () => {
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
    // Removed className={styles.container}
    <div>
      <h1>Benefits Management</h1>
      <p>Sign in via magic link with your email below</p>
      {loading ? (
        'Sending...'
      ) : (
        <form onSubmit={handleLogin}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button>
            Send magic link
          </button>
        </form>
      )}
    </div>
  );
};

export default Auth;