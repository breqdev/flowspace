const Router = require("@koa/router")

const minio = require("../utils/minio")

const IMAGE_SIZES = require("../utils/avatarImageSizes")

const router = new Router()


router.get("/profile/avatar/:hash/:size", async (ctx) => {
    let avatar

    if (!IMAGE_SIZES.includes(parseInt(ctx.params.size))) {
        ctx.throw(400, "Invalid size")
    }

    try  {
        avatar = await minio.getObject(process.env.MINIO_BUCKET_NAME, `${ctx.params.hash}-${ctx.params.size}.webp`)
    } catch (e) {
        ctx.throw(404, "No such avatar")
    }

    ctx.body = avatar
    ctx.type = "webp"
})

module.exports = router
