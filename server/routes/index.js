const Router = require("@koa/router")

const prisma = require("../utils/prisma")

const router = new Router()



router.get("/", async ctx => {
    const users = await prisma.user.count()
    ctx.body = {
        userCount: users
    }
})


module.exports = router