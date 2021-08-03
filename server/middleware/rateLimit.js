const ipaddr = require("ipaddr.js")

const redis = require("../utils/redis")

const rateLimit = async (ctx, next) => {
    if (process.env.DISABLE_RATE_LIMITING === "true") {
        return next()
    }

    if (ctx.request.method === "OPTIONS") {
        // Ignore CORS preflight requests
        return next()
    }

    // Every minute is a new interval
    const interval = Math.floor((new Date()).getUTCMinutes())

    let identifier

    if (ctx.user) {
        // The user has logged in
        // We can track them by their ID for ratelimiting purposes
        identifier = `user:${ctx.user.id}`
    } else {
        // Rely on their IP address instead

        let ip = ctx.request.ip

        if (process.env.NODE_ENV === "production") {
            // We are behind nginx proxy
            ip = ctx.request.headers["x-forwarded-for"].split(",")[0]
        }

        const parsedIp = ipaddr.parse(ip)

        if (parsedIp.kind() === "ipv6") {
            // Filter based on IPv6 /64
            // (typically, each /64 is one network)

            ip = parsedIp.parts.slice(0, 3).join(":") + "/64"
        }

        identifier = `ip:${ip}`
    }

    const key = `ratelimit:${identifier}:${interval}`

    const currentRequests = await redis.get(key)

    if (currentRequests > 100) {
        ctx.throw(429, "Too many requests")
    }

    await redis.incr(key)
    await redis.expire(key, 60)

    ctx.ratelimitIdentifier = identifier

    await next()
}

module.exports = rateLimit