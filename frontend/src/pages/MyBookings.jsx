import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';

const API = 'http://localhost:4000/api';

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      setMsg('');
      try {
        const resp = await fetch(`${API}/mybookings/${user.id}`);
        const data = await resp.json();
        setBookings(data);
      } catch (e) {
        setMsg('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, [user.id]);

  return (
    <div>
      <h2>My Bookings</h2>
      {msg && <div style={{ color: 'red', marginBottom: 10 }}>{msg}</div>}
      {loading ? (
        <p>Loading…</p>
      ) : bookings.length ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Resource</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Location</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>From</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>To</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.booking_id}>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{b.resource_name}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{b.location}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{new Date(b.start_time).toLocaleString()}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{new Date(b.end_time).toLocaleString()}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{b.booking_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No bookings found.</p>
      )}
    </div>
  );
}
