const parseBigInt = (str, ctx) => {
    try {
        return BigInt(str)
    } catch (e) {
        ctx.throw(400, "Invalid integer")
    }
}

module.exports = parseBigInt
