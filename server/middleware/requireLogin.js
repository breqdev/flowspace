const requireLogin = async (ctx, next) => {
    if (!ctx.user) {
        ctx.throw(401, "Login required")
    }

    await next()
}

module.exports = requireLogin
