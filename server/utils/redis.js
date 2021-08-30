const Redis = require("ioredis")

const redis = new Redis(process.env.REDIS_URL)

// Monkey patch ioredis to match the behavior of ioredis-mock
if (process.env.JEST_WORKER_ID === undefined) {
    redis.createConnectedClient = () => {
        return new Redis(process.env.REDIS_URL)
    }
}

module.exports = redis
