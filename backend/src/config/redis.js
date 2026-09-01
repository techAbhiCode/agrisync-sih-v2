const { createClient } = require('redis');

const redisClient = createClient({
  url: 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

let isRedisConnected = false;

async function connectRedis() {
  if (!isRedisConnected) {
    try {
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
