const jwt = require("jsonwebtoken")

const prisma = require("../utils/prisma")
const redis = require("../utils/redis")
const { getSignature } = require("../utils/createJWT")
const areAllowedToMessage = require("../utils/areAllowedToMessage")
const getDirectMessageChannel = require("../utils/getDirectMessageChannel")


const authenticateUser = async (token) => {
    const jwtPayload = jwt.decode(token)

    if (jwtPayload === null) {
        return false
    }

    const claimedUser = await prisma.user.findUnique({
        where: { id: BigInt(jwtPayload.sub) }
    })

    if (claimedUser === null) {
        return false
    }

    try {
        jwt.verify(
            token,
            getSignature(claimedUser),
            {
                algorithms: ["HS256"],
                subject: claimedUser.id.toString(),
            }
        )
    } catch (e) {
        return false
    }

    if (jwtPayload.type !== "access") {
        return false
    }

    return claimedUser
}


const gateway = async (ctx, next) => {
    if (ctx.request.path !== "/gateway") {
        return next()
    }

    if (!ctx.ws) {
        return next()
    }

    const ws = await ctx.ws()
    const subscriber = redis.createConnectedClient()

    let user = null

    const handleWebsocketMessage = async (message) => {
        const data = JSON.parse(message)

        if (!user) {
            if (data.type === "AUTHENTICATE") {
                user = await authenticateUser(data.token)

                if (!user) {
                    ws.send(JSON.stringify({
                        type: "ERROR",
                        message: "Invalid token",
                    }))
                    return
                } else {
                    ws.send(JSON.stringify({
                        type: "AUTHENTICATED",
                    }))
                }
            } else {
                ws.send(JSON.stringify({
                    type: "ERROR",
                    message: "You must authenticate first."
                }))
            }
            return
        }

        if (data.type === "SUBSCRIBE") {
            if (data.target === "MESSAGES_DIRECT") {
                // Subscribe to direct messages from a user
                let { user: targetUser } = data

                try {
                    targetUser = BigInt(targetUser)
                } catch (e) {
                    ws.send(JSON.stringify({
                        type: "ERROR",
                        message: "Invalid user ID"
                    }))
                    return
                }

                // Make sure the users are allowed to exchange messages
                if (!areAllowedToMessage(user.id, targetUser)) {
                    ws.send(JSON.stringify({
                        type: "ERROR",
                        message: "Invalid user ID"
                    }))
                    return
                }

                const channel = await getDirectMessageChannel(user.id, targetUser)

                await subscriber.subscribe(`messages:direct:${channel.id}`)

                ws.send(JSON.stringify({
                    type: "SUBSCRIBED",
                    target: "MESSAGES_DIRECT",
                    user: targetUser
                }))
            } else {
                ws.send(JSON.stringify({
                    type: "ERROR",
                    message: "Invalid target"
                }))
            }
        } else {
            ws.send(JSON.stringify({
                type: "ERROR",
                message: "Invalid type"
            }))
        }
    }

    ws.on("message", async (message) => {
        try {
            await handleWebsocketMessage(message)
        } catch (e) {
            console.error(e)
            ws.send(JSON.stringify({
                type: "ERROR",
                message: "Internal server error"
            }))
        }
    })

    subscriber.on("message", async (channel, message) => {
        ws.send(message)
    })

    ws.on("close", async () => {
        await subscriber.disconnect()
    })
}

module.exports = gateway
