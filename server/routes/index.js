const Router = require("@koa/router")
const { PrismaClient } = require("@prisma/client")

const router = new Router()
const prisma = new PrismaClient()


router.get("/", async ctx => {
    const users = await prisma.user.count()
    ctx.body = {
        userCount: users
    }
})


module.exports = router