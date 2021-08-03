const ipaddr = require("ipaddr.js")

const redis = require("../utils/redis")

const MAX_REQUESTS = 100

const getClientIP = ({ ip, xff }) => {
    // We might need to check X-Forwarded-For to see the real IP
    // in cases where our application is deployed behind a proxy.
    // However, we have to do this carefully, or the user will be able to
    // spoof their IP by setting X-Forwarded-For themselves.
    // Any proxies that forward this request will append their observed IP
    // to the end of this header -- they won't replace the original IP.
    // Thus, blindly checking the first IP address will leave us vulnerable.

    // Knowing the number of trusted proxies between us and the user,
    // we can count backwards in the X-Forwarded-For header to find the
    // IP address reported by the outermost trusted proxy.

    const proxies = parseInt(process.env.TRUSTED_PROXIES)

    console.log({ xff })

    if (proxies > 0) {
        return xff.split(",").reverse()[proxies - 1].trim()
    } else {
        return ip
    }
}

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
        let ip = getClientIP({
            ip: ctx.request.ip,
            xff: ctx.request.header["x-forwarded-for"]
        })

        const parsedIp = ipaddr.parse(ip)

        if (parsedIp.kind() === "ipv6") {
            // Filter based on IPv6 /64
            // (typically, each /64 is one network)

            ip = parsedIp.parts.slice(0, 4).join("-") + "/64"
        }

        identifier = `ip:${ip}`
    }

    const key = `ratelimit:${identifier}:${interval}`

    let currentRequests = await redis.get(key)

    await redis.incr(key)
    await redis.expire(key, 60)

    currentRequests += 1

    ctx.set("X-RateLimit-Limit", MAX_REQUESTS)
    ctx.set("X-RateLimit-Remaining", MAX_REQUESTS - currentRequests)
    ctx.set("X-RateLimit-Reset", Math.floor(Date.now() / 1000) + 60)
    ctx.set("X-RateLimit-Reset-After", 60)

    if (currentRequests > MAX_REQUESTS) {
        ctx.throw(429, "Too many requests")
    }

    ctx.ratelimitIdentifier = identifier

    await next()
}

module.exports = {
    rateLimit,
    getClientIP
}