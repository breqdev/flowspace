const errorCatcher = async (ctx, next) => {
    return next().catch(err => {

        const { statusCode, message } = err

        ctx.type = "json"
        ctx.status = statusCode || 500
        ctx.body = {
            msg: message
        }

        ctx.app.emit("error", err, ctx)
    })
}

const errorHandler = async (err, ctx) => {
    if (err.statusCode) {
        // console.log(`[${err.statusCode}] ${err.message}`)
        // console.warn(err, ctx)
    } else {
        console.error(err)
    }
}

module.exports = {
    errorCatcher,
    errorHandler
}