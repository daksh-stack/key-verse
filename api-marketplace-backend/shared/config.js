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

// Build a delegating client object so exported reference stays stable
const createDelegatingClient = (impl) => {
  const wrapper = {
    _impl: impl,
    isOpen: !!(impl && impl.isOpen),
    connect: async (...args) => {
      if (typeof wrapper._impl.connect === 'function') await wrapper._impl.connect(...args);
      wrapper.isOpen = !!wrapper._impl.isOpen;
    },
    on: (ev, cb) => { if (typeof wrapper._impl.on === 'function') wrapper._impl.on(ev, cb); },
    get: async (...args) => wrapper._impl.get(...args),
    set: async (...args) => wrapper._impl.set(...args),
    incr: async (...args) => wrapper._impl.incr(...args),
    expire: async (...args) => wrapper._impl.expire(...args),
    del: async (...args) => wrapper._impl.del(...args),
    setEx: async (...args) => wrapper._impl.setEx(...args),
    replaceImpl: (newImpl) => { wrapper._impl = newImpl; wrapper.isOpen = !!newImpl.isOpen; }
  };
  return wrapper;
};

let initialImpl;
if (redisUrl) {
  initialImpl = createClient({
    url: redisUrl,
    socket: isTls
      ? {
          tls: true,
          rejectUnauthorized: false,
          connectTimeout: 30000,
          reconnectStrategy: (retries) => {
            if (retries > 5) {
              console.log('❌ Redis: max reconnect attempts reached');
              return new Error('Max reconnect attempts reached');
            }
            return Math.min(retries * 500, 5000);
          },
        }
      : undefined,
  });
  // allow errors to be logged from the real client
  initialImpl.on('error', (err) => console.log('Redis Error:', err.message));
} else {
  console.log('⚠️ REDIS_URL not set — continuing without Redis (in-memory stub).');
  initialImpl = createInMemoryRedisStub();
}

const redisClient = createDelegatingClient(initialImpl);

// Create a reusable in-memory Redis-like stub
const createInMemoryRedisStub = () => {
  const _store = new Map();
  return {
    isOpen: true,
    connect: async () => {},
    on: () => {},
    get: async (key) => {
      const v = _store.get(key);
      return v === undefined ? null : v;
    },
    set: async (key, value) => {
      _store.set(key, value);
      return 'OK';
    },
    incr: async (key) => {
      const cur = parseInt(_store.get(key) || '0', 10) || 0;
      const next = cur + 1;
      _store.set(key, String(next));
      return next;
    },
    expire: async () => 1,
    del: async (key) => (_store.delete(key) ? 1 : 0),
    setEx: async (key, seconds, value) => {
      _store.set(key, value);
      return 'OK';
    },
  };
};

// Proper async init (no top-level await issues)
const connectRedis = async () => {
  try {
    if (!redisClient) return;

    if (!redisClient.isOpen && typeof redisClient.connect === 'function') {
      await redisClient.connect();
      if (redisClient.isOpen) console.log('🟢 Connected to Redis!');
    }
  } catch (err) {
    console.error('⚠️  Redis connection failed:', err.message);
    console.error('   Falling back to in-memory cache; the app will continue without Redis.');
    // Replace the failing client's implementation with an in-memory stub to avoid repeated DNS errors
    if (typeof redisClient.replaceImpl === 'function') {
      redisClient.replaceImpl(createInMemoryRedisStub());
      redisClient.isOpen = true;
    }
  }
};

module.exports = { pool, redisClient, connectRedis };
