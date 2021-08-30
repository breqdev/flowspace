const gateway = async (ctx, next) => {
    if (ctx.request.path !== "/gateway") {
        return next()
    }

    if (!ctx.ws) {
        return next()
    }

    const ws = await ctx.ws()

    // TODO: set up gateway connection
}

module.exports = gateway
