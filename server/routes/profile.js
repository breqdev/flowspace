const Router = require("@koa/router")

const prisma = require("../utils/prisma")

const router = new Router()


const PUBLIC_PROFILE_FIELDS = ["id", "name", "pronouns", "url", "location", "bio"]

const filterKeys = (input, allowed) => (
    Object.keys(input).reduce((output, key) => {
        if (allowed.includes(key)) {
            output[key] = input[key]
        }
        return output
    }, {})
)

router.post("/profile/@me", async (ctx) => {
    await prisma.user.update({
        where: { id: ctx.user.id },
        data: filterKeys(ctx.request.body, PUBLIC_PROFILE_FIELDS)
    })

    ctx.body = {
        msg: "Updated user profile"
    }
})

router.get("/profile/:id", async (ctx) => {
    let user

    if (ctx.params.id === "@me") {
        user = ctx.user
    } else {
        let id

        try {
            id = BigInt(ctx.params.id)
        } catch (error) {
            ctx.throw(400, "Invalid user ID")
        }

        user = await prisma.user.findUnique({ where: { id } })
    }

    if (!user) {
        ctx.throw(404, "User not found")
    }

    ctx.body = filterKeys(user, PUBLIC_PROFILE_FIELDS)
})

module.exports = router
