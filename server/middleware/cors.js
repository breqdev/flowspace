const cors = async (ctx, next) => {
    const origin = ctx.get("origin")

    ctx.vary("Origin")

    if (origin) {
        ctx.set("Access-Control-Allow-Origin", origin)
        ctx.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With")
        ctx.set("Access-Control-Allow-Credentials", true)
        ctx.set("Access-Control-Max-Age", 3600)

        if (
            ctx.method === "OPTIONS"
            && ctx.get("Access-Control-Request-Method")
        ) {
            // This is a preflight request

            ctx.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")

            ctx.status = 204
            return
        }
    }

    await next()
}

module.exports = cors
