import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const API = 'http://localhost:4000/api';

function SearchTab() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const loadResources = async () => {
    setLoading(true);
    setMsg('');
    try {
      const resp = await fetch(`${API}/resources`);
      const data = await resp.json();
      setResources(data);
    } catch (e) {
      setMsg('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadResources(); }, []);

  const book = async (resource_id) => {
    if (!from || !to) {
      setMsg('Pick start and end time first');
      return;
    }
    setMsg('');
    try {
      const payload = {
        resource_id,
        user_id: user.id,
        start_time: from.replace('T',' ') + ':00',
        end_time: to.replace('T',' ') + ':00',
        purpose: 'Demo',
      };
      const resp = await fetch(`${API}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.message || 'Booking failed');
      setMsg(data.status === 'APPROVED' ? 'Booked (Approved)' : 'Request sent (Pending)');
    } catch (e) {
      setMsg(e.message || 'Booking failed');
    }
  };

  return (
    <div>
      <div style={{ display:'flex', gap:8, marginBottom:12 }}>
        <input type="datetime-local" value={from} onChange={e=>setFrom(e.target.value)} />
        <input type="datetime-local" value={to} onChange={e=>setTo(e.target.value)} />
        <button onClick={loadResources} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>
      {msg && <div style={{ marginBottom:12, color:'#2563eb' }}>{msg}</div>}
      <ul style={{ paddingLeft: 18 }}>
        {resources.map(r => (
          <li key={r.id} style={{ marginBottom: 8 }}>
            {r.name} — {r.location} — cap {r.capacity}
            <button onClick={() => book(r.id)} style={{ marginLeft: 8 }}>
              Book
            </button>
          </li>
        ))}
        {!resources.length && !loading && <li>No resources found</li>}
      </ul>
    </div>
  );
}

function AddResource() {
  const [name, setName] = useState('');
  const [loc, setLoc] = useState('');
  const [cap, setCap] = useState(10);
  const [restricted, setRestricted] = useState(false);
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    const resp = await fetch(`${API}/resources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, location: loc, capacity: Number(cap),
        equipment: [], restricted
      })
    });
    const data = await resp.json();
    if (resp.ok) setMsg('resource added');
    else setMsg(data.message || 'failed');
  };

  return (
    <form onSubmit={submit} style={{ maxWidth: 420 }}>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" required style={{ display:'block', margin:'8px 0', padding:8 }} />
      <input value={loc} onChange={e=>setLoc(e.target.value)} placeholder="Location" required style={{ display:'block', margin:'8px 0', padding:8 }} />
      <input type="number" value={cap} onChange={e=>setCap(e.target.value)} placeholder="Capacity" required style={{ display:'block', margin:'8px 0', padding:8 }} />
      <label style={{ display:'block', margin:'8px 0' }}>
        <input type="checkbox" checked={restricted} onChange={e=>setRestricted(e.target.checked)} /> Restricted
      </label>
      <button type="submit">Add Resource</button>
      {msg && <div style={{ marginTop:10, color:'#2563eb' }}>{msg}</div>}
    </form>
  );
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState('search');

  useEffect(() => {
    if (!user) nav('/login', { replace: true });
    else setTab('search');
  }, [user, nav]);

  if (!user) return null;

  return (
    <div>
      <nav style={{ display: 'flex', gap: 12, padding: 12, borderBottom: '1px solid #eee' }}>
        <button onClick={() => setTab('search')}>Search</button>
        <button onClick={() => setTab('bookings')}>My Bookings</button>
        <button onClick={() => setTab('resources')}>Resources</button>
        <span style={{ marginLeft: 'auto' }}>{user.name} ({user.role})</span>
        <button onClick={() => { logout(); nav('/login', { replace: true }); }}>Logout</button>
      </nav>

      <div style={{ padding: 16 }}>
        {tab === 'search' && <SearchTab />}
        {tab === 'bookings' && <div>My bookings (coming soon)</div>}
        {tab === 'resources' && <AddResource />}
      </div>
    </div>
  );
}
