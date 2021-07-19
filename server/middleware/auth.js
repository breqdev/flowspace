const compose = require("koa-compose")
const jwt = require("jsonwebtoken")

const { getSignature } = require("../utils/createJWT")
const prisma = require("../utils/prisma")

const getAuthHeader = async (ctx, next) => {
    ctx.state.token = null

    if (ctx.header?.authorization) {
        const parts = ctx.header.authorization.trim().split(" ")

        if (parts.length !== 2) {
            ctx.throw(401, "Invalid authorization header")
        }

        const scheme = parts[0]

        if (scheme !== "Bearer") {
            ctx.throw(401, "Invalid authorization scheme")
        }

        const credentials = parts[1]

        if (scheme === "Bearer") {
            ctx.state.token = credentials
        }
    }

    await next()
}

const getClaimedUser = async (ctx, next) => {
    if (ctx.state.token) {
        ctx.state.jwtPayload = jwt.decode(ctx.state.token)

        if (ctx.state.jwtPayload === null) {
            ctx.throw(401, "Invalid token")
        }

        // BigInt can't be represented as JSON
        ctx.state.jwtPayload.sub = BigInt(ctx.state.jwtPayload.sub)

        ctx.state.claimedUser = await prisma.user.findUnique({
            where: {
                id: ctx.state.jwtPayload.sub,
            }
        })
    }

    await next()
}


const verifyUserJwt = async (ctx, next) => {
    if (ctx.state.claimedUser) {
        try {
            jwt.verify(
                ctx.state.token,
                getSignature(ctx.state.claimedUser),
                {
                    algorithms: ["HS256"],
                    subject: ctx.state.claimedUser.id.toString(),
                }
            )
        } catch (e) {
            ctx.throw(401, e.message, { originalError: e });
        }

        ctx.state.tokenType = ctx.state.jwtPayload.type

        // Don't grant access in special cases (e.g. refresh tokens)
        if (ctx.state.tokenType === "access") {
            ctx.user = ctx.state.claimedUser
        }
    }

    await next()
}

module.exports = compose([getAuthHeader, getClaimedUser, verifyUserJwt])
