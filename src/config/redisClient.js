
const redis = require('redis');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL // Use Render's Redis URL
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect();

module.exports = redisClient;