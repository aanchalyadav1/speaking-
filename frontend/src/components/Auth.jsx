// src/components/Auth.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../utils/firebase.js';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function Auth({ onAuthenticated }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Google Sign-In
  const googleLogin = async () => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const token = await res.user.getIdToken();
      onAuthenticated({ user: res.user, token });
      navigate('/test'); // redirect to test page after login
    } catch (error) {
      console.error('Google login error:', error);
      alert(error.message);
    }
    setLoading(false);
  };

  // Email login
  const emailLogin = async () => {
    if (!email || !pw) return alert('Enter email and password');
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, pw);
      const token = await res.user.getIdToken();
      onAuthenticated({ user: res.user, token });
      navigate('/test');
    } catch (error) {
      console.error('Email login error:', error);
      alert(error.message);
    }
    setLoading(false);
  };

  // Email sign-up
  const signUp = async () => {
    if (!email || !pw) return alert('Enter email and password');
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pw);
      const token = await res.user.getIdToken();
      onAuthenticated({ user: res.user, token });
      navigate('/test');
    } catch (error) {
      console.error('Sign-up error:', error);
      alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth card" style={{ maxWidth: 520, margin: '80px auto', textAlign: 'center' }}>
      <h2 style={{ fontSize: 20, marginBottom: 20 }}>Sign in to Speaking Test</h2>

      <button
        onClick={googleLogin}
        disabled={loading}
        style={{
          padding: '10px 14px',
          borderRadius: 8,
          background: 'linear-gradient(90deg,#7c3aed,#06b6d4)',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        {loading ? 'Signing in...' : 'Sign in with Google'}
      </button>

      <div style={{ marginTop: 20 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 10, width: '80%', margin: '6px 0' }}
        />
        <input
          placeholder="Password"
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          style={{ padding: 10, width: '80%', margin: '6px 0' }}
        />

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10 }}>
          <button onClick={emailLogin} disabled={loading} style={{ padding: '8px 12px', borderRadius: 8 }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <button onClick={signUp} disabled={loading} style={{ padding: '8px 12px', borderRadius: 8 }}>
            {loading ? 'Signing up...' : 'Sign up'}
          </button>
        </div>
      </div>
    </div>
  );
}
