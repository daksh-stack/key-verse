const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const axios = require('axios');
const { pool, redisClient, connectRedis } = require('../shared/config');

const app = express();
const PORT = process.env.PROXY_PORT || 3001;

app.use(cors());
app.use(morgan('dev'));
app.use(helmet());

// Connect to Redis
connectRedis();

app.use('/proxy/:apiId', async (req, res) => {
    try {
        // 0. DDoS Protection (IP-based rate limiting: 100 req/min)
        const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const ddosKey = `ddos:${clientIp}`;
        const ipRequests = await redisClient.incr(ddosKey);

        if (ipRequests === 1) await redisClient.expire(ddosKey, 60);
        if (ipRequests > 100) {
            return res.status(429).json({ error: 'ddos_mitigation', message: 'Rate limit exceeded.' });
        }

        // 1. Auth & Subscriber Lookup
        const apiKey = req.headers['x-api-key'];
        if (!apiKey) return res.status(401).json({ error: 'missing X-API-Key' });

        // UUID format validation to prevent PG 22P02 error
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(apiKey)) {
            return res.status(401).json({ error: 'invalid_key_format' });
        }

        const userResult = await pool.query('SELECT id FROM users WHERE api_key = $1', [apiKey]);
        if (userResult.rows.length === 0) return res.status(401).json({ error: 'invalid_key' });

        const userId = userResult.rows[0].id;
        const apiId = req.params.apiId;

        // 2. Tiered Quota Enforcement
        let subData = await redisClient.get(`sub_meta:${userId}:${apiId}`);
        if (!subData) {
            const sub = await pool.query(`
                SELECT p.quota, p.type FROM subscriptions s JOIN plans p ON s.plan_id = p.id 
                WHERE s.user_id = $1 AND s.api_id = $2 AND s.status = 'active'
            `, [userId, apiId]);

            if (sub.rows.length === 0) return res.status(403).json({ error: 'subscription_required' });
            subData = JSON.stringify(sub.rows[0]);
            await redisClient.set(`sub_meta:${userId}:${apiId}`, subData, { EX: 600 });
        }
        
        const { quota, type } = JSON.parse(subData);

        // 3. Real-time Usage Monitoring
        const usageKey = `usage:${userId}:${apiId}`;
        const currentUsage = await redisClient.incr(usageKey);

        if (type !== 'pay_per_use' && currentUsage > parseInt(quota)) {
            console.log(`[QUOTA_BLOCK] User: ${userId} | API: ${apiId} | Usage: ${currentUsage}/${quota}`);
            return res.status(429).json({ error: 'quota_exhausted' });
        }

        // 4. Usage Warnings
        if (currentUsage === Math.floor(quota * 0.85)) {
            console.log(`[ALERT] 85% for user ${userId}`);
        }

        // 5. Target Resolution
        const apiResult = await pool.query(
            'SELECT base_url, mock_enabled, mock_response, gateway_config FROM apis WHERE id = $1',
            [apiId]
        );
        if (apiResult.rows.length === 0) return res.status(404).json({ error: 'API not found' });
        const api = apiResult.rows[0];
        const targetBase = api.base_url;

        // 6. Mock Engine
        if (api.mock_enabled) {
            const mock = api.mock_response || { status: 200, body: { message: "Mock Success" } };
            return res.status(mock.status || 200).json(mock.body);
        }

        // 7. Gateway Transformations
        const config = api.gateway_config || {};
        const headers = { ...req.headers };
        delete headers['x-api-key'];
        delete headers['host'];
        delete headers['connection'];

        // 8. Proxying
        try {
            const response = await axios({
                method: req.method,
                url: `${targetBase}${req.url}`,
                data: req.body,
                headers,
                timeout: config.timeout || 10000,
                validateStatus: null
            });

            // Strip problematic transmission headers
            const relayHeaders = { ...response.headers };
            delete relayHeaders['transfer-encoding'];
            delete relayHeaders['content-length'];
            delete relayHeaders['connection'];

            res.status(response.status).set(relayHeaders).send(response.data);
        } catch (proxyErr) {
            res.status(502).json({ error: 'bad_gateway', message: proxyErr.message });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`🛡️ Proxy Runtime running on port ${PORT}`);
});
