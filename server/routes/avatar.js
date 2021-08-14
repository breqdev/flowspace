const Router = require("@koa/router")

const minio = require("../utils/minio")

const router = new Router()


const IMAGE_SIZES = [1024, 128, 32]


router.get("/profile/avatar/:hash/:size", async (ctx) => {
    let avatar

    if (!IMAGE_SIZES.includes(parseInt(ctx.params.size))) {
        ctx.throw(400, "Invalid size")
    }

    try  {
        avatar = await minio.getObject("flowspace", `${ctx.params.hash}-${ctx.params.size}.webp`)
    } catch (e) {
        ctx.throw(404, "No such avatar")
    }

    ctx.body = avatar
    ctx.type = "webp"
})

module.exports = {
    avatarRoutes: router,
    IMAGE_SIZES
}
