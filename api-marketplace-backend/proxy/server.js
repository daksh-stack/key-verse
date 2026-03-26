const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
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
            return res.status(429).json({ error: 'ddos_mitigation', message: 'Rate limit exceeded for this node. Contact support if this is an error.' });
        }

        // 1. Auth & Subscriber Lookup
        const apiKey = req.headers['x-api-key'];
        if (!apiKey) return res.status(401).json({ error: 'missing X-API-Key' });

        const userResult = await pool.query('SELECT id FROM users WHERE api_key = $1', [apiKey]);
        if (userResult.rows.length === 0) return res.status(401).json({ error: 'invalid_key' });

        const userId = userResult.rows[0].id;
        const apiId = req.params.apiId;

        // 2. Tiered Quota Enforcement
        let quota = await redisClient.get(`quota:${userId}:${apiId}`);
        if (!quota) {
            const sub = await pool.query(`
                SELECT p.quota FROM subscriptions s JOIN plans p ON s.plan_id = p.id 
                WHERE s.user_id = $1 AND s.api_id = $2 AND s.status = 'active'
            `, [userId, apiId]);

            if (sub.rows.length === 0) return res.status(403).json({ error: 'subscription_required' });
            quota = sub.rows[0].quota;
            await redisClient.set(`quota:${userId}:${apiId}`, quota, { EX: 600 });
        }

        // 3. Real-time Usage Monitoring
        const usageKey = `usage:${userId}:${apiId}`;
        const currentUsage = await redisClient.incr(usageKey);

        if (currentUsage > parseInt(quota)) {
            return res.status(429).json({
                error: 'quota_exhausted',
                message: `Limit of ${quota} reached. Upgrade your plan.`
            });
        }

        // 4. Usage Warnings (85% and 100%)
        if (currentUsage === Math.floor(quota * 0.85) || currentUsage === parseInt(quota)) {
            const alertType = currentUsage === parseInt(quota) ? 'EXHAUSTED' : 'WARNING';
            console.log(`[MONETIZATION] User ${userId} reached ${alertType} for API ${apiId} (${currentUsage}/${quota})`);
            // Trigger Nodemailer utility here
        }

        // 5. Target Resolution & Smart Engine Config
        const apiResult = await pool.query(
            'SELECT base_url, mock_enabled, mock_response, gateway_config FROM apis WHERE id = $1',
            [apiId]
        );
        if (apiResult.rows.length === 0) return res.status(404).json({ error: 'API not found' });
        const api = apiResult.rows[0];

        // 6. Mock Engine (Sub-50ms)
        if (api.mock_enabled) {
            const mock = api.mock_response || { status: 200, body: { message: "Mock Dynamic Success" } };
            return res.status(mock.status || 200).json(mock.body);
        }

        // 7. Gateway Strategy: Timeouts & Transformations
        const targetBase = api.base_url;
        const config = api.gateway_config || {};
        const timeout = config.timeout || 5000;

        // Header Obfuscation + Transformation
        const headers = { ...req.headers };
        delete headers['x-api-key'];
        delete headers['host'];
        delete headers['connection'];

        if (config.transformations?.request) {
            Object.keys(config.transformations.request).forEach(k => {
                headers[k] = config.transformations.request[k];
            });
        }

        // 8. Proxying with Axios (Precision Control)
        try {
            const response = await axios({
                method: req.method,
                url: `${targetBase}${req.url.replace(`/proxy/${apiId}`, '')}`,
                data: req.body,
                headers,
                timeout,
                validateStatus: null // Capture all statuses
            });

            // Response Transformation
            const resHeaders = { ...response.headers };
            if (config.transformations?.response) {
                Object.keys(config.transformations.response).forEach(k => {
                    resHeaders[k] = config.transformations.response[k];
                });
            }

            res.set(resHeaders);
            res.status(response.status).send(response.data);
        } catch (proxyErr) {
            console.error('Upstream Failure:', proxyErr.message);
            res.status(502).json({ error: 'bad_gateway', message: 'Target node did not respond in time.' });
        }
    } catch (error) {
        console.error('Proxy runtime error: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`🛡️ Proxy Runtime running on port ${PORT}`);
});
