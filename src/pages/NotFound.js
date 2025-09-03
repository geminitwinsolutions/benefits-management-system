import React from 'react';
import { Link } from 'react-router-dom';

const styles = {
  container: {
    padding: '2rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 'calc(100vh - 120px)',
  },
  title: {
    fontSize: '5rem',
    fontWeight: 'bold',
    margin: 0,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: '1.5rem',
    margin: '0 0 1.5rem 0',
    color: '#555',
  },
  link: {
    fontSize: '1rem',
    color: '#fff',
    backgroundColor: '#007bff',
    padding: '0.75rem 1.5rem',
    borderRadius: '5px',
    textDecoration: 'none',
  }
};

function NotFound() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>404</h1>
      <h2 style={styles.subtitle}>Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/" style={styles.link}>
        Go to Dashboard
      </Link>
    </div>
  );
}

export default NotFound;