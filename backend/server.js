const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '1234',
  database: 'RMS', 
  waitForConnections: true,
  connectionLimit: 10,
});

// Login endpoint checking email and pwd_hash
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT user_id AS id, name, email, role, pwd_hash FROM Users WHERE email=?',
      [email]
    );
    if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });

    const user = rows[0];
    if (password !== user.pwd_hash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    delete user.pwd_hash;
    res.json({ token: 'demo', user });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// List available resources
app.get('/api/resources', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Resources WHERE status="Available" ORDER BY name'
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Create a booking
app.post('/api/bookings', async (req, res) => {
  const { resource_id, user_id, start_time, end_time } = req.body;
  try {
    // Check if resource exists and get status
    const [[resource]] = await pool.query(
      'SELECT status FROM Resources WHERE resource_id = ?',
      [resource_id]
    );
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    // Insert into Used_By if not exists to satisfy foreign key constraint
    await pool.query(
      'INSERT IGNORE INTO Used_By (user_id, resource_id) VALUES (?, ?)',
      [user_id, resource_id]
    );

    // Status: 'Booked' if resource available, else 'Unavailable' or handle as per your logic
    const status = resource.status === 'Available' ? 'Booked' : 'Unavailable';

    // Insert booking
    const [result] = await pool.query(
      'INSERT INTO Bookings (resource_id, user_id, start_time, end_time, status) VALUES (?, ?, ?, ?, ?)',
      [resource_id, user_id, start_time, end_time, status]
    );
    res.json({ id: result.insertId, status });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});


// Add a new resource
app.post('/api/resources', async (req, res) => {
  const { name, location, capacity, equipment = '', status = 'Available' } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO Resources (name, location, capacity, equipment, status) VALUES (?, ?, ?, ?, ?)',
      [name, location, Number(capacity), equipment, status]
    );
    res.json({ id: result.insertId, message: 'resource added' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.get('/api/resources-with-bookings', async (_req, res) => {
  try {
    const sql = `
      SELECT 
        r.resource_id, r.name, r.location, r.capacity, r.status AS base_status,
        ub.user_id AS used_by_user_id, u.name AS used_by_name, u.email AS used_by_email,
        b.booking_id, b.start_time, b.end_time
      FROM Resources r
      LEFT JOIN Used_By ub ON r.resource_id = ub.resource_id
      LEFT JOIN Users u ON ub.user_id = u.user_id
      LEFT JOIN Bookings b ON r.resource_id = b.resource_id AND ub.user_id = b.user_id 
          AND b.status = 'Booked'
      ORDER BY r.name, u.name
    `;
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});



app.get('/api/mybookings/:user_id', async (req, res) => {
  const userId = req.params.user_id;
  try {
    const sql = `
      SELECT 
        b.booking_id, b.start_time, b.end_time, b.status AS booking_status,
        r.resource_id, r.name AS resource_name, r.location
      FROM Bookings b
      JOIN Resources r ON b.resource_id = r.resource_id
      WHERE b.user_id = ?
      ORDER BY b.start_time DESC
    `;
    const [rows] = await pool.query(sql, [userId]);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});



app.listen(4000, () => console.log('API running on http://localhost:4000'));
