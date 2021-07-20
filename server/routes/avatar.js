const Router = require("@koa/router")

const minio = require("../utils/minio")

const router = new Router()

router.get("/profile/avatar/:hash", async (ctx) => {
    let avatar

    if (ctx.params.hash === "@default") {
        ctx.body = await minio.getObject("flowspace", "default.png")
        ctx.type = "png"
        return
    }

    try  {
        avatar = await minio.getObject("flowspace", ctx.params.hash)
    } catch (e) {
        ctx.throw(404, "No such avatar")
    }

    ctx.body = avatar
    ctx.type = ctx.params.hash.split(".").pop()
})

module.exports = router
