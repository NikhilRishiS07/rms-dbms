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
  database: 'rms',
  waitForConnections: true,
  connectionLimit: 10,
});


// Login (no password for now)
app.post('/api/login', async (req, res) => {
  const { email } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, dept FROM users WHERE email=?',
      [email]
    );
    if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ token: 'demo', user: rows[0] });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// List resources (no availability filtering yet)
app.get('/api/resources', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM resources WHERE active=1 ORDER BY name');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Create booking (no conflict check yet)
app.post('/api/bookings', async (req, res) => {
  const { resource_id, user_id, start_time, end_time, purpose } = req.body;
  try {
    // Decide status from resource.restricted
    const [[r]] = await pool.query('SELECT restricted FROM resources WHERE id=?', [resource_id]);
    if (!r) return res.status(404).json({ message: 'Resource not found' });

    const status = r.restricted ? 'PENDING' : 'APPROVED';
    const [result] = await pool.query(
      `INSERT INTO bookings (resource_id, user_id, start_time, end_time, status, purpose)
       VALUES (?,?,?,?,?,?)`,
      [resource_id, user_id, start_time, end_time, status, purpose || null]
    );
    res.json({ id: result.insertId, status });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.listen(4000, () => console.log('API running on http://localhost:4000'));

app.post('/api/resources', async (req, res) => {
  const { name, location, capacity, equipment = [], restricted = 0 } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO resources (name, location, capacity, equipment, restricted)
       VALUES (?,?,?,?,?)`,
      [name, location, Number(capacity), JSON.stringify(equipment), restricted ? 1 : 0]
    );
    res.json({ id: result.insertId, message: 'resource added' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});
