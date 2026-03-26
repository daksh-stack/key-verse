require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const { randomUUID } = require('crypto');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { createProxyMiddleware } = require('http-proxy-middleware');
// we made the real redis
const { createClient } = require('redis');

// Real Redis Client using the official package
const client = createClient({
  url: process.env.REDIS_URL
});

// Catch connection errors so the server doesn't crash on network failure
client.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
  await client.connect();
  console.log("🟢 Connected to Real Redis!");
})();




app.use(cors());
app.use(morgan('dev'));
app.use(express.json()); // Parse JSON request bodies

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false }
});

// Helmet BEFORE routes
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:3000"]
    }
  }
}));

app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error('DB query error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});



app.post('/users/signup', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const apiKey = randomUUID();  // ← This creates the random key!

    const result = await pool.query(
      'INSERT INTO users (email, password_hash, role, api_key) VALUES ($1, $2, $3, $4) RETURNING id, email, role, api_key',
      [email, hashed, role || 'consumer', apiKey]
    );

    const newUser = result.rows[0];
    res.status(201).json({
      message: 'User created!',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        api_key: newUser.api_key   // ← You get the key back here!
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.get('/apis', async (req, res) => {
  const result = await pool.query('SELECT * FROM apis');
  res.json(result.rows);
})

app.post('/apis/register', async (req, res) => {
  const { name, base_url } = req.body;
  await pool.query('INSERT INTO apis (name, base_url) VALUES ($1, $2)', [name, base_url]);
  res.send('api registered!!')
})

app.use('/proxy/:apiId', async (req, res) => {
  try {
    // 1. Get the API key from headers (like a secret ticket)
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(401).json({ error: 'missing X-API-Key header' });
    }
    // 2. Check if this key belongs to a real user
    const userResult = await pool.query(
      'SELECT * FROM users WHERE api_key = $1',
      [apiKey]
    );
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'invalid api key' });
    }
    // 3. Simple rate limit check (max 10 calls per hour per key)
    const rateKey = `rate:${apiKey}`;
    let calls = await client.get(rateKey);
    calls = calls ? parseInt(calls) : 0;

    if (calls >= 10) {
      return res.status(429).json({ error: 'too many requests! wait 1 hours.' });
    }
    // 4. Count this request and set timer (only set expiry on the first request of the window)
    const currentCalls = await client.incr(rateKey);
    if (currentCalls === 1) {
      await client.expire(rateKey, 3600);
    }

    // 5. Find the real API base URL from database
    const apiResult = await pool.query(
      'SELECT base_url FROM apis WHERE id = $1',
      [req.params.apiId]
    );
    if (apiResult.rows.length === 0) {
      return res.status(404).json({ error: 'API not found' });
    }
    const targetBase = apiResult.rows[0].base_url;



    // 7. Now create the real proxy using http-proxy-middleware
    const proxy = createProxyMiddleware({
      target: targetBase,  // base part only
      changeOrigin: true,   // changes host header so remote server thinks we are the client
      pathRewrite: (path, req) => {
        // remove /proxy/1/ from the beginning
        return path.replace(`/proxy/${req.params.apiId}`, '')
      },
      selfHandleResponse: false,
      on: {
        error: (err, req, res) => {
          console.error('Proxy error: ', err);
          if (!res.headersSent) {
            res.status(502).json({ error: 'Bad gateway - proxy failed' });
          }
        }
      }
    });
    // 8. Run the proxy right now for this request
    proxy(req, res, () => {
      // This only runs if proxy fails to handle — shouldn't happen
      res.status(502).json({ error: 'Proxy failed to handle request' });
    });
  } catch (error) {
    console.error('Proxy error: ', error);
    res.status(500).json({ error: 'Something went  wrong on  server' })
  }
})

const server = app.listen(3000, () => {
  console.log('Server running on port 3000');
})

module.exports = app;