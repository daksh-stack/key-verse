const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');
const SwaggerParser = require('@apidevtools/swagger-parser');
const OpenAPIParser = require('openapi-snippet');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const { pool, redisClient, connectRedis } = require('../shared/config');

const app = express();
const PORT = process.env.MANAGEMENT_PORT || 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(helmet());

// Connect to Redis
connectRedis();

// Provider Authentication Middleware
const authenticateProvider = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) return res.status(401).json({ error: 'Missing X-API-Key header' });

    try {
        const result = await pool.query('SELECT * FROM users WHERE api_key = $1', [apiKey]);
        if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid API Key' });
        
        const user = result.rows[0];
        if (user.role !== 'provider') return res.status(403).json({ error: 'Forbidden: Provider access required' });
        
        req.user = user;
        next();
    } catch (err) {
        console.error("Auth Error:", err);
        res.status(500).json({ error: 'Authentication engine failure' });
    }
};

// User Signup
app.post('/users/signup', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const hashed = await bcrypt.hash(password, 10);
        const apiKey = randomUUID();

        const result = await pool.query(
            'INSERT INTO users (email, password_hash, role, api_key) VALUES ($1, $2, $3, $4) RETURNING id, email, role, api_key',
            [email, hashed, role || 'consumer', apiKey]
        );

        res.status(201).json({
            message: 'User created!',
            user: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// User Login
app.post('/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid identity credentials' });
        
        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password_hash);
        
        if (!match) return res.status(401).json({ error: 'Invalid identity credentials' });
        
        res.json({
            message: 'Session initialized!',
            user: { id: user.id, email: user.email, role: user.role, api_key: user.api_key }
        });
    } catch (err) {
        res.status(500).json({ error: 'Authentication engine failure' });
    }
});

// List Users
app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, email, role FROM users');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// List APIs
app.get('/apis', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM apis');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Register API
app.post('/apis/register', authenticateProvider, async (req, res) => {
    try {
        const { name, base_url } = req.body;
        if (!name || !base_url) {
            return res.status(400).json({ error: 'Name and base_url required' });
        }
        const apiResult = await pool.query('INSERT INTO apis (name, base_url) VALUES ($1, $2) RETURNING id', [name, base_url]);
        const apiId = apiResult.rows[0].id;

        await seedDefaultPlans(apiId);

        res.status(201).json({ message: 'API registered successfully', apiId });
    } catch (err) {
        res.status(500).json({ error: 'Failed to register API' });
    }
});

// Detailed Usage Stats for Consumer
app.get('/stats/:apiKey', async (req, res) => {
    try {
        const { apiKey } = req.params;
        // 1. Get User
        const userRes = await pool.query('SELECT id FROM users WHERE api_key = $1', [apiKey]);
        if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        const userId = userRes.rows[0].id;

        // 2. Get Subscriptions with specific usage from Redis (Source of Truth)
        const subs = await pool.query(`
            SELECT s.api_id, s.usage_count, p.name as plan_name, p.quota, a.name as api_name
            FROM subscriptions s
            JOIN plans p ON s.plan_id = p.id
            JOIN apis a ON s.api_id = a.id
            WHERE s.user_id = $1
        `, [userId]);

        const detailedStats = await Promise.all(subs.rows.map(async (sub) => {
            const redisUsage = await redisClient.get(`usage:${userId}:${sub.api_id}`);
            return {
                ...sub,
                usage: redisUsage ? parseInt(redisUsage) : sub.usage_count
            };
        }));

        res.json({
            apiKey,
            subscriptions: detailedStats
        });
    } catch (err) {
        console.error("Stats Engine Error:", err);
        res.status(500).json({ error: 'Failed to fetch detailed stats' });
    }
});

// Run Database Migration
const runMigration = async () => {
    try {
        console.log('📦 Starting Comprehensive Migration: Standardizing on UUID identity nodes...');
        
        await pool.query(`
            CREATE EXTENSION IF NOT EXISTS "pgcrypto";

            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT DEFAULT 'consumer',
                api_key UUID UNIQUE DEFAULT gen_random_uuid(),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS apis (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                base_url TEXT NOT NULL,
                logo_url TEXT,
                openapi_spec JSONB,
                readme_markdown TEXT,
                category TEXT DEFAULT 'General',
                visibility JSONB DEFAULT '{"status": "public"}',
                gateway_config JSONB DEFAULT '{"timeout": 5000}',
                monetization JSONB DEFAULT '{"mode": "free"}',
                mock_enabled BOOLEAN DEFAULT false,
                mock_response JSONB DEFAULT '{"status": 200, "body": {"message": "ApexHub Mock Response v1.0"}}',
                deployment_type TEXT DEFAULT 'hosted',
                external_gateway_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS plans (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                quota INTEGER NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                api_id UUID REFERENCES apis(id) ON DELETE CASCADE,
                type TEXT NOT NULL DEFAULT 'standard',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS subscriptions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                api_id UUID REFERENCES apis(id) ON DELETE CASCADE,
                plan_id UUID REFERENCES plans(id),
                usage_count INTEGER DEFAULT 0,
                status TEXT DEFAULT 'active',
                last_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, api_id)
            );
        `);
        console.log('✅ Migration complete: ApexHub Zero-Trust Identity Schema active');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
    }
};

runMigration();

// --- Studio Endpoints ---

// Get Full API Meta (for Studio)
app.get('/studio/:apiId', async (req, res) => {
    try {
        const { apiId } = req.params;
        const result = await pool.query('SELECT * FROM apis WHERE id = $1', [apiId]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'API not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Update Studio Tabs (General PATCH)
app.patch('/studio/:apiId/:tab', authenticateProvider, async (req, res) => {
    try {
        const { apiId, tab } = req.params;
        const data = req.body;

        const allowedTabs = ['general', 'definitions', 'docs', 'gateway', 'monetize', 'community'];
        if (!allowedTabs.includes(tab)) return res.status(400).json({ error: 'Invalid tab update' });

        let query = '';
        let params = [];

        if (tab === 'general') {
            query = 'UPDATE apis SET name = $1, category = $2, logo_url = $3, visibility = $4 WHERE id = $5';
            params = [data.name, data.category, data.logo_url, data.visibility, apiId];
        } else if (tab === 'definitions') {
            query = 'UPDATE apis SET openapi_spec = $1 WHERE id = $2';
            params = [data.openapi_spec, apiId];
        } else if (tab === 'docs') {
            query = 'UPDATE apis SET readme_markdown = $1 WHERE id = $2';
            params = [data.readme_markdown, apiId];
        } else if (tab === 'gateway') {
            query = 'UPDATE apis SET gateway_config = $1, mock_enabled = $2, mock_response = $3, deployment_type = $4, external_gateway_url = $5 WHERE id = $6';
            params = [data.gateway_config, data.mock_enabled, data.mock_response, data.deployment_type, data.external_gateway_url, apiId];
        } else if (tab === 'monetize') {
            query = 'UPDATE apis SET monetization = $1 WHERE id = $2';
            params = [data.monetization, apiId];
        }

        await pool.query(query, params);
        res.json({ message: `${tab.toUpperCase()} updated successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update studio data' });
    }
});

// Get Code Snippets from OpenAPI
app.get('/api/:apiId/snippets', async (req, res) => {
    try {
        const { apiId } = req.params;
        const result = await pool.query('SELECT openapi_spec FROM apis WHERE id = $1', [apiId]);

        if (result.rows.length === 0 || !result.rows[0].openapi_spec) {
            return res.status(404).json({ error: 'Spec not found' });
        }

        const spec = result.rows[0].openapi_spec;
        const targets = ['shell_curl', 'node_fetch', 'python_requests', 'go_native', 'java_okhttp'];

        // Generate snippets for every path/method in the spec
        const snippets = OpenAPIParser.getSnippets(spec, targets);

        const flattenedSnippets = [];
        snippets.forEach(endpoint => {
            if (endpoint.snippets) {
                endpoint.snippets.forEach(s => flattenedSnippets.push(s));
            }
        });

        res.json(flattenedSnippets);
    } catch (err) {
        console.error("Snippet Engine Error:", err);
        res.status(500).json({ error: 'Snippet generation failed' });
    }
});

// --- Hybrid & Analytics Webhooks ---

// Push External Analytics (for Hybrid Mode)
app.post('/api/analytics/push', async (req, res) => {
    try {
        const { apiKey, apiId, usageCount } = req.body;
        if (!apiKey || !apiId || !usageCount) return res.status(400).json({ error: 'invalid_payload' });

        // Authenticate the consumer by key
        const userRes = await pool.query('SELECT id FROM users WHERE api_key = $1', [apiKey]);
        if (userRes.rows.length === 0) return res.status(401).json({ error: 'invalid_consumer_key' });
        const userId = userRes.rows[0].id;

        // Find sub and increment
        await pool.query(
            'UPDATE subscriptions SET usage_count = usage_count + $1 WHERE user_id = $2 AND api_id = $3',
            [usageCount, userId, apiId]
        );

        res.json({ status: 'telemetry_received' });
    } catch (err) {
        res.status(500).json({ error: 'telemetry_sync_failed' });
    }
});

const axios = require('axios');

// --- Global Discovery Engine (APIs.guru Integration) ---
let apisGuruCache = { data: null, lastFetched: 0 };
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 Hours

const getApisGuruData = async () => {
    const now = Date.now();
    if (apisGuruCache.data && (now - apisGuruCache.lastFetched < CACHE_DURATION)) {
        return apisGuruCache.data;
    }
    try {
        console.log('🌐 Refreshing Global API Dictionary (APIs.guru)...');
        const res = await axios.get('https://api.apis.guru/v2/list.json');
        apisGuruCache = { data: res.data, lastFetched: now };
        return res.data;
    } catch (err) {
        console.error("APIs.guru fetch failed:", err.message);
        return apisGuruCache.data || {};
    }
};

app.get('/apis/search', async (req, res) => {
    try {
        const { q = '' } = req.query;
        const query = q.toLowerCase();

        // 1. Fetch Internal APIs
        const internalRes = await pool.query(
            "SELECT id, name, category, logo_url FROM apis WHERE visibility->>'status' = 'public' AND (LOWER(name) LIKE $1 OR LOWER(category) LIKE $1)",
            [`%${query}%`]
        );
        const internalApis = internalRes.rows.map(api => ({ ...api, origin: 'keyverse' }));

        // 2. Fetch/Filter External APIs (APIs.guru) - only if query is substantial
        let externalApis = [];
        if (query.length > 2) {
            const guruData = await getApisGuruData();
            // gurusData is an object where keys are names like "github.com"
            Object.entries(guruData).forEach(([key, value]) => {
                const apiName = value.preferred || Object.keys(value.versions)[0];
                const info = value.versions[apiName].info;
                
                if (info.title.toLowerCase().includes(query) || key.toLowerCase().includes(query)) {
                    externalApis.push({
                        id: `ext-${key}`,
                        name: info.title,
                        category: 'External Market',
                        logo_url: info['x-logo']?.url || null,
                        origin: 'external',
                        external_url: info['x-origin']?.[0]?.url || null,
                        description: info.description
                    });
                }
            });
        }

        // 3. Merge & Limit (Priority to Internal)
        const results = [...internalApis, ...externalApis.slice(0, 30)];
        res.json(results);
    } catch (err) {
        console.error("Discovery Engine Failure:", err);
        res.status(500).json({ error: 'Search failed' });
    }
});

// Get Public APIs
app.get('/apis/public', async (req, res) => {
    try {
        const result = await pool.query("SELECT id, name, category, logo_url FROM apis WHERE visibility->>'status' = 'public'");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Portal sync failed' });
    }
});

// --- Consumer Endpoints ---

// Helper to seed default plans for an API
const seedDefaultPlans = async (apiId) => {
    const plans = [
        { name: 'BASIC', quota: 1000, price: 0, type: 'free' },
        { name: 'PRO', quota: 50000, price: 25, type: 'standard' },
        { name: 'ULTRA', quota: 250000, price: 75, type: 'standard' },
        { name: 'MEGA', quota: 1000000, price: 150, type: 'standard' }
    ];

    for (const plan of plans) {
        await pool.query(`
            INSERT INTO plans (name, quota, price, api_id, type)
            VALUES ($1, $2, $3, $4, $5)
        `, [plan.name, plan.quota, plan.price, apiId, plan.type]);
    }
};

app.post('/api/:apiId/subscribe', async (req, res) => {
    try {
        const { apiId } = req.params;
        const { planId } = req.body;
        const apiKey = req.headers['x-api-key'];

        if (!apiKey) return res.status(401).json({ error: 'missing_key' });

        const userRes = await pool.query('SELECT id FROM users WHERE api_key = $1', [apiKey]);
        if (userRes.rows.length === 0) return res.status(401).json({ error: 'invalid_key' });
        const userId = userRes.rows[0].id;

        await pool.query(`
            INSERT INTO subscriptions (user_id, api_id, plan_id)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, api_id) DO UPDATE SET plan_id = $3
        `, [userId, apiId, planId]);

        // Sync to Redis for real-time proxy access
        await redisClient.set(`sub:${userId}:${apiId}`, planId);

        res.json({ message: 'SUBSCRIPTION_ACTIVE' });
    } catch (err) {
        console.error("Subscription Error:", err);
        res.status(500).json({ error: 'Subscription failed' });
    }
});

app.get('/apis/compare', async (req, res) => {
    try {
        const { ids } = req.query;
        if (!ids) return res.json([]);
        
        const idList = ids.split(',');
        const guruData = await getApisGuruData();
        
        const results = await Promise.all(idList.map(async (id) => {
            if (id.startsWith('ext-')) {
                const key = id.replace('ext-', '');
                const entry = guruData[key];
                if (!entry) return null;
                const apiName = entry.preferred || Object.keys(entry.versions)[0];
                const info = entry.versions[apiName].info;
                
                return {
                    id,
                    name: info.title,
                    category: 'External Market',
                    logo_url: info['x-logo']?.url || null,
                    origin: 'external',
                    plans: [{ name: 'MARKET', price: 'PAID/FREE', quota: 'DYNAMIC', type: 'EXTERNAL' }],
                    stability: '99.9%',
                    latency: 'Varies by Edge'
                };
            } else {
                const apiRes = await pool.query('SELECT * FROM apis WHERE id = $1', [id]);
                const plansRes = await pool.query('SELECT * FROM plans WHERE api_id = $1', [id]);
                if (apiRes.rows.length === 0) return null;
                return {
                    ...apiRes.rows[0],
                    origin: 'keyverse',
                    plans: plansRes.rows,
                    stability: '99.9% (Verified)',
                    latency: '< 5ms (KeyVerse Edge)'
                };
            }
        }));

        res.json(results.filter(r => r !== null));
    } catch (err) {
        console.error("Comparison Aggregator Failure:", err);
        res.status(500).json({ error: 'Aggregation failed' });
    }
});

// Get Consumer Usage
app.get('/consumer/:userId/usage', async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await pool.query(`
            SELECT s.*, p.name as plan_name, p.quota, a.name as api_name
            FROM subscriptions s
            JOIN plans p ON s.plan_id = p.id
            JOIN apis a ON s.api_id = a.id
            WHERE s.user_id = $1
        `, [userId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Usage fetch failed' });
    }
});

// Get Plans for an API
app.get('/api/:apiId/plans', async (req, res) => {
    try {
        const { apiId } = req.params;
        const result = await pool.query('SELECT * FROM plans WHERE api_id = $1 ORDER BY price ASC', [apiId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch plans' });
    }
});

// Delete a Plan
app.delete('/plans/:planId', authenticateProvider, async (req, res) => {
    try {
        const { planId } = req.params;
        await pool.query('DELETE FROM plans WHERE id = $1', [planId]);
        res.json({ message: 'PLAN_DELETED' });
    } catch (err) {
        res.status(500).json({ error: 'Delete failed' });
    }
});

// Add a Plan
app.post('/api/:apiId/plans', authenticateProvider, async (req, res) => {
    try {
        const { apiId } = req.params;
        const { name, quota, price, type } = req.body;
        const result = await pool.query(`
            INSERT INTO plans (name, quota, price, api_id, type)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [name, quota, price, apiId, type || 'standard']);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Plan creation failed' });
    }
});

// --- Monthly Reset Job (1st of every month) ---
cron.schedule('0 0 1 * *', async () => {
    console.log('📅 Initiating Monthly Usage Reset...');
    try {
        await pool.query('UPDATE subscriptions SET usage_count = 0, last_reset = CURRENT_TIMESTAMP');
        const keys = await redisClient.keys('usage:*');
        if (keys.length > 0) await redisClient.del(keys);
        console.log('✅ Usage reset complete');
    } catch (err) {
        console.error('❌ Reset failed:', err);
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Management Plane running on port ${PORT}`);
});

module.exports = app;
