const Router = require("@koa/router")

const prisma = require("../utils/prisma")

const router = new Router()



router.get("/", async ctx => {
    const userCount = await prisma.user.count({
        where: {
            verified: true
        }
    })

    const commit = process.env.GIT_REV

    ctx.body = {
        welcome: "this is the flowspace api.",
        didYouMean: "to go to https://flowspace.breq.dev/ ?",
        userCount,
        commit,
        identifier: ctx.ratelimitIdentifier
    }
})


module.exports = router