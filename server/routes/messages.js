const Router = require("@koa/router")
const parseBigInt = require("../utils/parseBigInt")

const snowcloud = require("../utils/snowcloud")
const prisma = require("../utils/prisma")
const areAllowedToMessage = require("../utils/areAllowedToMessage")
const getDirectMessageChannel = require("../utils/getDirectMessageChannel")
const sendGatewayMessage = require("../utils/sendGatewayMessage")

const router = new Router()



router.get("/messages/direct/:id", async ctx => {
    const fromId = ctx.user.id
    const toId = parseBigInt(ctx.params.id, ctx)

    if (!(await areAllowedToMessage(fromId, toId))) {
        ctx.throw(404, "User not found")
    }

    const channel = await getDirectMessageChannel(fromId, toId)

    const messages = await prisma.message.findMany({
        where: { channelId: channel.id },
        orderBy: { id: "asc" }
    })

    ctx.body = messages
})


router.post("/messages/direct/:id", async ctx => {
    const fromId = ctx.user.id
    const toId = parseBigInt(ctx.params.id, ctx)

    if (!(await areAllowedToMessage(fromId, toId))) {
        ctx.throw(404, "User not found")
    }

    const channel = await getDirectMessageChannel(fromId, toId)

    const message = await prisma.message.create({
        data: {
            id: await snowcloud.generate(),
            sentOn: new Date(),
            channelId: channel.id,
            authorId: fromId,
            content: ctx.request.body.content
        }
    })

    await sendGatewayMessage(
        `messages:direct:${channel.id.toString()}`,
        "MESSAGES_DIRECT",
        message
    )

    ctx.body = message
})


module.exports = router
