const Router = require("@koa/router")

const prisma = require("../utils/prisma")

const router = new Router()


const PUBLIC_PROFILE_FIELDS = ["name", "pronouns", "url", "location", "bio"]

const filterKeys = (input, allowed) => (
    Object.keys(input).reduce((output, key) => {
        if (allowed.includes(key)) {
            output[key] = input[key]
        }
        return output
    }, {})
)


router.get("/profile/@me", async (ctx) => {
    ctx.body = filterKeys(ctx.user, PUBLIC_PROFILE_FIELDS)
})

router.post("/profile/@me", async (ctx) => {
    await prisma.user.update({
        where: { id: ctx.user.id },
        data: filterKeys(ctx.request.body, PUBLIC_PROFILE_FIELDS)
    })

    ctx.body = {
        msg: "Updated user profile"
    }
})

module.exports = router
