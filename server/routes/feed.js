const Router = require("@koa/router")
const prisma = require("../utils/prisma")

const router = new Router()

router.get("/feed", async ctx => {
    const feed = await prisma.post.findMany({
        take: 10,
        where: {
            author: {
                incomingRelationships: {
                    some: {
                        fromId: {
                            equals: ctx.user.id
                        },
                        type: {
                            equals: "FOLLOW"
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    })

    // TODO: allow private posts when mutual
    ctx.body = feed.filter(
        post => !(post.isPrivate)
    )
})

module.exports = router
