const crypto = require("crypto")

const Router = require("@koa/router")
const multer = require("@koa/multer")

const prisma = require("../utils/prisma")
const minio = require("../utils/minio")

const router = new Router()
const upload = multer({ storage: multer.memoryStorage() })

const PUBLIC_PROFILE_FIELDS = ["id", "name", "pronouns", "url", "location", "bio", "avatarHash"]

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

router.post("/profile/avatar/@me", upload.single("avatar"), async (ctx) => {
    if (!ctx.file) {
        ctx.throw(400, "No file specified")
    }

    const originalFileName = ctx.file.originalname
    const extension = originalFileName.split(".").pop()

    if (!(["png", "jpg", "jpeg", "gif"].includes(extension.toLowerCase()))) {
        ctx.throw(400, "Invalid file type")
    }

    if (ctx.request.file.size > 10 * 1024 * 1024) {
        ctx.throw(400, "File too large")
    }

    if (!ctx.request.file.mimetype.startsWith("image/")) {
        ctx.throw(400, "Invalid file type")
    }

    const avatar = ctx.request.file.buffer

    const avatarHash = crypto.createHash("sha256").update(avatar).digest("hex") + "." + extension

    minio.putObject("flowspace", avatarHash, avatar)

    await prisma.user.update({
        where: { id: ctx.user.id },
        data: { avatarHash }
    })

    ctx.body = {
        msg: "Updated user avatar",
        avatarHash
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
