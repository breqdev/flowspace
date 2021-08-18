const Router = require("@koa/router")
const prisma = require("../utils/prisma")

const parseBigInt = require("../utils/parseBigInt")

const router = new Router()


router.get("/relationship/outgoing/:id", async (ctx) => {
    // get your outgoing relationship to another user

    const toId = parseBigInt(ctx.params.id, ctx)
    const fromId = ctx.user.id

    const relationship = await prisma.userRelationship.findUnique({
        where: {
            fromId_toId: {
                fromId,
                toId,
            }
        }
    })

    if (!relationship) {
        ctx.body = {
            establishedOn: null,
            type: "NONE",
            fromId,
            toId
        }
    } else {
        ctx.body = {
            establishedOn: relationship.establishedOn,
            type: relationship.type,
            fromId,
            toId
        }
    }
})

router.post("/relationship/outgoing/:id", async (ctx) => {
    // create an outgoing relationship with another user
    const toId = parseBigInt(ctx.params.id, ctx)
    const fromId = ctx.user.id
    const type = ctx.request.body.type

    if (fromId === toId) {
        ctx.throw(400, "Cannot create relationship with self")
    }

    const allowedTypes = ["WAVE", "FOLLOW", "BLOCK", "NONE"]

    if (!allowedTypes.includes(type)) {
        ctx.throw(400, "Invalid relationship type")
    }

    // verify that the target user exists
    const targetUser = await prisma.user.findUnique({
        where: {
            id: toId
        }
    })

    if (!targetUser || !targetUser.verified) {
        ctx.throw(404, "User does not exist")
    }

    // check the inverse (incoming) relationship
    const incoming = await prisma.userRelationship.findUnique({
        where: {
            fromId_toId: {
                fromId: toId,
                toId: fromId
            }
        }
    })

    if (type === "BLOCK") {
        // if this is a BLOCK, then if the other user has WAVEd or FOLLOWed,
        // we need to remove that relationship

        if (incoming && incoming.type !== "BLOCK") {
            await prisma.userRelationship.delete({
                where: {
                    fromId_toId: {
                        fromId: toId,
                        toId: fromId
                    }
                }
            })
        }
    } else if (type === "NONE") {
        // the user wishes to delete the current relationship

        const existingRelationship = await prisma.userRelationship.findUnique({
            where: {
                fromId_toId: {
                    fromId,
                    toId
                }
            }
        })

        if (existingRelationship) {
            await prisma.userRelationship.delete({
                where: {
                    fromId_toId: {
                        fromId,
                        toId
                    }
                }
            })
        }

        ctx.body = {
            type: "NONE",
            fromId,
            toId
        }

        return
    } else {
        // if this is a WAVE or a FOLLOW, we need to verify that the user is not blocked

        if (incoming && incoming.type === "BLOCK") {
            ctx.status = 403
            ctx.body = {
                msg: "You cannot create a relationship with this user"
            }
            return
        }
    }

    const relationship = await prisma.userRelationship.upsert({
        where: {
            fromId_toId: {
                fromId,
                toId
            }
        },
        update: {
            type,
        },
        create: {
            establishedOn: new Date(),
            type,
            fromId,
            toId
        },
    })

    ctx.body = {
        establishedOn: relationship.establishedOn,
        type: relationship.type,
        fromId,
        toId
    }
})

router.get("/relationship/incoming/:id", async (ctx) => {
    // get the incoming relationship from another user

    const fromId = parseBigInt(ctx.params.id, ctx)
    const toId = ctx.user.id

    const relationship = await prisma.userRelationship.findUnique({
        where: {
            fromId_toId: {
                fromId,
                toId
            }
        }
    })

    if (!relationship || relationship.type === "BLOCK") {
        // don't directly inform users that they have been blocked
        // just send an empty response

        ctx.body = {
            type: "NONE",
            fromId,
            toId
        }
    } else {
        // ok to inform users that they have been WAVEd or FOLLOWed

        ctx.body = {
            type: relationship.type,
            fromId,
            toId
        }
    }
})


router.get("/relationship/mutual", async (ctx) => {
    // get the ids of users that we follow/wave and that wave/follow us
    // this is the list of users that we can message

    const users = await prisma.user.findMany({
        where: {
            outgoingRelationships: {
                some: {
                    toId: {
                        equals: ctx.user.id
                    },
                    type: {
                        in: ["WAVE", "FOLLOW"]
                    }
                }
            },
            incomingRelationships: {
                some: {
                    fromId: {
                        equals: ctx.user.id
                    },
                    type: {
                        in: ["WAVE", "FOLLOW"]
                    }
                }
            }
        }
    })

    ctx.body = users.map(user => user.id)
})


module.exports = router
