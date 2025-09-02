// src/App.js
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signInWithGithub() {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <div className="container">
      <h1>Employee Benefits</h1>
      <p>The one-stop shop for managing your employee benefits.</p>
      {!session ? (
        <div className="login-actions">
          <p>Please sign in to manage your benefits.</p>
          <button onClick={signInWithGithub}>Sign In with GitHub</button>
        </div>
      ) : (
        <div className="logged-in-view">
          <p>Welcome, {session.user.email}!</p>
          <button onClick={signOut}>Sign Out</button>
        </div>
      )}
    </div>
  )
}

export default App
