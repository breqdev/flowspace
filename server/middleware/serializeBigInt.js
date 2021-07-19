// If the response is an object, and the object contains a BigInt, convert it
// to a string so the object can be JSON serialized.
const serializeBigInt = (object) => {
    if (typeof object === "object" && object !== null) {
        Object.keys(object).forEach(key => {
            if (typeof object[key] === "bigint") {
                object[key] = object[key].toString()
            } else if (object[key] && typeof object[key] === "object") {
                object[key] = serializeBigInt(object[key])
            }
        })
    }

    return object
}


const serializeBigIntMiddleware = async (ctx, next) => {
    await next()

    ctx.body = serializeBigInt(ctx.body)
}

module.exports = serializeBigIntMiddleware
