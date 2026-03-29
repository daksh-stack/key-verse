const { Pool } = require('pg');
const { createClient } = require('redis');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Database Pool
const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: { rejectUnauthorized: false }
});

// Redis Client
const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log("🟢 Connected to Redis!");
    }
};

module.exports = {
    pool,
    redisClient,
    connectRedis
};
