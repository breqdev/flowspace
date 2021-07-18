const Router = require("@koa/router")
const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()
const router = new Router()


router.get("/", async ctx => {
    const users = await prisma.user.count()
    ctx.body = {
        userCount: users
    }
})


module.exports = router