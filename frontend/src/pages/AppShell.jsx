import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import MyBookings from './MyBookings';

const API = 'http://localhost:4000/api';

function isResourceUnderUse(bookings) { //checks if the current time falls under any allocated time, if yes then the rs is under use
  const now = new Date();
  for (const b of bookings) {
    if (!b.start_time || !b.end_time) continue;
    const start = new Date(b.start_time);
    const end = new Date(b.end_time);
    if (start <= now && now <= end) {
      return true; // Resource currently under use
    }
  }
  return false; // Resource free
}


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
      const resp = await fetch(`${API}/resources-with-bookings`);
      const data = await resp.json();
      setResources(data);
    } catch (e) {
      setMsg('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadResources(); }, []);

  const book = async (resourceId) => {
    if (!from || !to) {
      setMsg('Pick start and end time first');
      return;
    }
    setMsg('');
    try {
      const payload = {
        resource_id: resourceId,
        user_id: user.id,
        start_time: from.replace('T', ' ') + ':00',
        end_time: to.replace('T', ' ') + ':00',
      };
      const resp = await fetch(`${API}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.message || 'Booking failed');
      setMsg(data.status === 'Booked' ? 'Booked Successfully' : 'Booking Pending');
    } catch (e) {
      setMsg(e.message || 'Booking failed');
    }
  };

  // Group rows by resource for display
  const groupedResources = resources.reduce((acc, r) => {
    if (!acc[r.resource_id]) {
      acc[r.resource_id] = {...r, bookings: []};
    }
    acc[r.resource_id].bookings.push(r);
    return acc;
  }, {});

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input type="datetime-local" value={from} onChange={e => setFrom(e.target.value)} />
        <input type="datetime-local" value={to} onChange={e => setTo(e.target.value)} />
        <button onClick={loadResources} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>
      {msg && <div style={{ marginBottom: 12, color: '#2563eb' }}>{msg}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', padding: 8 }}>Resource</th>
            <th style={{ border: '1px solid black', padding: 8 }}>Location</th>
            <th style={{ border: '1px solid black', padding: 8 }}>Capacity</th>
            <th style={{ border: '1px solid black', padding: 8 }}>Base Status</th>
            <th style={{ border: '1px solid black', padding: 8 }}>Current Status</th>
            <th style={{ border: '1px solid black', padding: 8 }}>Used By</th>
            <th style={{ border: '1px solid black', padding: 8 }}>Booking From</th>
            <th style={{ border: '1px solid black', padding: 8 }}>Booking To</th>
            <th style={{ border: '1px solid black', padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(groupedResources).map(resource => {
            const currentStatus = resource.base_status === 'Unavailable'
              ? 'Unavailable'
              : isResourceUnderUse(resource.bookings)
                ? 'Under Use'
                : 'Free';

            return resource.bookings.map((booking, i) => (
              <tr key={`${resource.resource_id}-${booking.used_by_user_id || i}`}>
                {i === 0 && (
                  <>
                    <td rowSpan={resource.bookings.length} style={{ border: '1px solid black', padding: 8 }}>{resource.name}</td>
                    <td rowSpan={resource.bookings.length} style={{ border: '1px solid black', padding: 8 }}>{resource.location}</td>
                    <td rowSpan={resource.bookings.length} style={{ border: '1px solid black', padding: 8 }}>{resource.capacity}</td>
                    <td rowSpan={resource.bookings.length} style={{ border: '1px solid black', padding: 8 }}>{resource.base_status}</td>
                    <td rowSpan={resource.bookings.length} style={{ border: '1px solid black', padding: 8 }}>{currentStatus}</td>
                  </>
                )}
                <td style={{ border: '1px solid black', padding: 8 }}>{booking.used_by_name || '—'}</td>
                <td style={{ border: '1px solid black', padding: 8 }}>
                  {booking.start_time ? new Date(booking.start_time).toLocaleString() : '—'}
                </td>
                <td style={{ border: '1px solid black', padding: 8 }}>
                  {booking.end_time ? new Date(booking.end_time).toLocaleString() : '—'}
                </td>
                <td style={{ border: '1px solid black', padding: 8 }}>
                  <button 
                    onClick={() => book(resource.resource_id)} 
                    disabled={loading || !from || !to || resource.base_status !== 'Available'}
                  >
                    Book
                  </button>
                </td>
              </tr>
            ));
          })}
          {!resources.length && !loading && (
            <tr>
              <td colSpan="9" style={{ textAlign: 'center', padding: 8 }}>No resources found</td>
            </tr>
          )}
        </tbody>
      </table>
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
        equipment: '', restricted,
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
        {tab === 'bookings' && <MyBookings/>}
        {tab === 'resources' && (
          user.role === 'Admin'
            ? <AddResource />
            : <div>You do not have permission to add resources.</div>
        )}
      </div>
    </div>
  );
}
