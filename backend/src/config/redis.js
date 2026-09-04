const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({
  url: redisUrl
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

let isRedisConnected = false;

async function connectRedis() {
  if (!isRedisConnected) {
    try {
      if (process.env.NODE_ENV === 'production' && !process.env.REDIS_URL) {
        console.log('Skipping Redis connection (No REDIS_URL provided in production)');
        return;
      }
      await redisClient.connect();
      isRedisConnected = true;
      console.log('Redis connected successfully for Caching');
    } catch (err) {
      console.error('Failed to connect to Redis', err);
    }
  }
}

connectRedis();

module.exports = redisClient;
