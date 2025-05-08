const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Database connection settings
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  port: 3307,  // Ensure it matches the MySQL container port
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Route to save user data
app.post('/users', async (req, res) => {
  const { name, email, tenant } = req.body;

  // Determine the correct schema for the tenant (e.g. tenant_hari or tenant_sita)
  const database = `tenant_${tenant}`;

  if (!name || !email || !tenant) {
    return res.status(400).json({ error: 'Name, email, and tenant are required' });
  }

  try {
    const connection = await mysql.createConnection({ ...dbConfig, database });

    // Insert user into the appropriate tenant's users table
    await connection.execute('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);

    // Close connection
    await connection.end();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to insert user' });
  }
});

app.listen(5000, () => {
  console.log('Backend running on port 5000');
});
