const redis = require("../utils/redis")
const areAllowedToMessage = require("../utils/areAllowedToMessage")
const getDirectMessageChannel = require("../utils/getDirectMessageChannel")

const gateway = async (ctx, next) => {
    if (ctx.request.path !== "/gateway") {
        return next()
    }

    if (!ctx.ws) {
        return next()
    }

    const ws = await ctx.ws()
    const subscriber = redis.createConnectedClient()

    const handleWebsocketMessage = async (message) => {
        const data = JSON.parse(message)

        if (data.type === "SUBSCRIBE") {
            if (data.target === "MESSAGES_DIRECT") {
                // Subscribe to direct messages from a user
                let { user } = data

                try {
                    user = BigInt(user)
                } catch (e) {
                    ws.send(JSON.stringify({
                        type: "ERROR",
                        message: "Invalid user ID"
                    }))
                    return
                }

                // Make sure the users are allowed to exchange messages
                if (!areAllowedToMessage(ctx.user.id, user)) {
                    ws.send(JSON.stringify({
                        type: "ERROR",
                        message: "Invalid user ID"
                    }))
                    return
                }

                const channel = await getDirectMessageChannel(ctx.user.id, user)

                await subscriber.subscribe(`messages:direct:${channel.id}`)

                ws.send(JSON.stringify({
                    type: "SUBSCRIBED",
                    target: "MESSAGES_DIRECT",
                    user
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
