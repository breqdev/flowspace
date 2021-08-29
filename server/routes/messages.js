const Router = require("@koa/router")
const parseBigInt = require("../utils/parseBigInt")

const snowcloud = require("../utils/snowcloud")
const prisma = require("../utils/prisma")

const router = new Router()


const areAllowedToMessage = async (fromId, toId) => {
    const outgoingRelationship = await prisma.userRelationship.findUnique({
        where: {
            fromId_toId: {
                fromId,
                toId
            }
        }
    })

    const incomingRelationship = await prisma.userRelationship.findUnique({
        where: {
            fromId_toId: {
                fromId: toId,
                toId: fromId
            }
        }
    })

    if (!outgoingRelationship || !incomingRelationship) {
        return false
    }

    if (outgoingRelationship.type === "BLOCK" || incomingRelationship.type === "BLOCK") {
        return false
    }

    return true
}


router.get("/messages/direct/:id", async ctx => {
    const fromId = ctx.user.id
    const toId = parseBigInt(ctx.params.id, ctx)

    if (!(await areAllowedToMessage(fromId, toId))) {
        ctx.throw(404, "User not found")
    }

    const channel = await prisma.channel.findFirst({
        where: {
            type: "DIRECT",
            directRecipients: {
                every: { id: { in: [fromId, toId] } }
            }
        }
    })

    if (!channel) {
        ctx.body = []
        return
    }

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

    let channel = await prisma.channel.findFirst({
        where: {
            type: "DIRECT",
            directRecipients: {
                every: { id: { in: [fromId, toId] } }
            }
        }
    })

    if (!channel) {
        channel = await prisma.channel.create({
            data: {
                id: await snowcloud.generate(),
                type: "DIRECT",
                directRecipients: {
                    connect: [ { id: fromId }, { id: toId } ]
                }
            }
        })
    }

    const message = await prisma.message.create({
        data: {
            id: await snowcloud.generate(),
            sentOn: new Date(),
            channelId: channel.id,
            authorId: fromId,
            content: ctx.request.body.content
        }
    })

    ctx.body = message
})


module.exports = router
