const { Pool } = require("pg");
const { createClient } = require("redis");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

// Database Pool
const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false },
});

const redisUrl = process.env.REDIS_URL || "";
const isTls = redisUrl.startsWith("rediss://");

const redisClient = createClient({
  url: redisUrl,
  socket: isTls ? {
    tls: true,
    rejectUnauthorized: false,
    connectTimeout: 30000,       // 30 seconds to establish connection
    reconnectStrategy: (retries) => {
      if (retries > 5) {
        console.log("❌ Redis: max reconnect attempts reached");
        return new Error("Max reconnect attempts reached");
      }
      return Math.min(retries * 500, 5000); // exponential backoff, max 5s
    },
  } : undefined,
});

redisClient.on("error", (err) =>
  console.log("Redis Error:", err.message)
);

// Proper async init (no top-level await issues)
const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("🟢 Connected to Redis!");
    }
  } catch (err) {
    console.error("⚠️  Redis connection failed:", err.message);
    console.error("   The app will continue without Redis caching.");
  }
};

module.exports = { pool, redisClient, connectRedis };