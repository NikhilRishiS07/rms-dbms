import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const API = 'http://localhost:4000/api';

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const resp = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!resp.ok) {
        // Extract error message from response json
        const errorData = await resp.json();
        throw new Error(errorData.message || 'Invalid credentials');
      }
      const { token, user } = await resp.json();
      login(token, user);
      nav('/app', { replace: true });
    } catch (e) {
      setErr(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f6f7fb' }}>
      <form
        onSubmit={onSubmit}
        style={{ width: 360, padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 6px 24px rgba(0,0,0,0.08)' }}
      >
        <h2 style={{ marginBottom: 16 }}>Login</h2>

        <input
          type="email"
          placeholder="admin@inst.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: 10, margin: '6px 0 12px', border: '1px solid #ddd', borderRadius: 8 }}
        />

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: 10, margin: '6px 0 12px', border: '1px solid #ddd', borderRadius: 8 }}
        />

        {err && <div style={{ color: '#b00020', marginBottom: 10 }}>{err}</div>}

        <button disabled={loading} type="submit" style={{ width: '100%', padding: 10, borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none' }}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <p style={{ fontSize: 12, marginTop: 12, color: '#666' }}>
          Try seeded emails: alice@example.com (an admin), bob@example.com, carol@example.com, david@example.com
        </p>
      </form>
    </div>
  );
}
