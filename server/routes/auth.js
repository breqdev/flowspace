const Router = require("@koa/router")

const { generatePasswordHash, checkPasswordHash } = require("../utils/hashing")
const { createAccessToken, createRefreshToken, ACCESS_TOKEN_EXPIRES } = require("../utils/createJWT")
const sendEmail = require("../utils/email")

const snowcloud = require("../utils/snowcloud")
const prisma = require("../utils/prisma")
const redis = require("../utils/redis")

const router = new Router()


const handleRateLimit = async (ctx, score) => {
    if (process.env.DISABLE_RATE_LIMITING === "true") {
        return
    }

    const interval = Math.floor((new Date()).getUTCDate())

    const key = `authRateLimit:${ctx.ratelimitIdentifier}:${interval}`

    const currentScore = await redis.get(key)

    if (currentScore + score > 100) {
        ctx.throw(429, "too many requests")
    }

    await redis.incrby(key, score)

    await redis.expire(key, 24 * 60 * 60)
}


router.post("/auth/signup", async (ctx) => {
    await handleRateLimit(ctx, 10)

    const name = ctx.request.body.name
    const email = ctx.request.body.email
    const password = ctx.request.body.password

    if (!name || !email || !password) {
        ctx.throw(400, "missing required fields")
    }

    if (name === "") {
        ctx.throw(400, "name is required")
    }

    if (name.length > 100) {
        ctx.throw(400, "name is too long")
    }

    const hash = generatePasswordHash(password)

    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser) {
        ctx.throw(400, "Email already taken")
    }

    const id = await snowcloud.generate()

    const user = await prisma.user.create({
        data: {
            id,

            email,
            password: hash,
            registeredOn: new Date(),

            name,
        }
    })

    const refreshToken = createRefreshToken(user)

    await sendEmail(user.email, "SIGNUP", {
        name,
        token: refreshToken
    })

    ctx.body = {
        msg: "Refresh token sent to email"
    }
})


router.post("/auth/login", async (ctx) => {
    await handleRateLimit(ctx, 1)

    const email = ctx.request.body.email
    const password = ctx.request.body.password

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !checkPasswordHash(user.password, password)) {
        ctx.throw(401, "Invalid credentials")
    }

    if (!user.verified) {
        const refreshToken = createRefreshToken(user)

        await sendEmail(user.email, "VERIFY_LOGIN", {
            name: user.name,
            token: refreshToken
        })

        ctx.throw(401, "Verify email first")
    }

    ctx.body = {
        access_token: createAccessToken(user),
        refresh_token: createRefreshToken(user),
        token_type: "Bearer",
        expires_in: ACCESS_TOKEN_EXPIRES,
        id: user.id,
    }
})


router.post("/auth/verify", async (ctx) => {
    await handleRateLimit(ctx, 1)

    if (ctx.state.tokenType !== "refresh") {
        ctx.throw(401, "Invalid token")
    }

    const user = ctx.state.claimedUser

    await prisma.user.update({
        where: { id: user.id },
        data: { verified: true },
    })

    ctx.body = {
        access_token: createAccessToken(user),
        token_type: "Bearer",
        expires_in: ACCESS_TOKEN_EXPIRES,
    }
})


router.post("/auth/refresh", async (ctx) => {
    await handleRateLimit(ctx, 1)

    if (ctx.state.tokenType !== "refresh") {
        ctx.throw(401, "Invalid token")
    }

    const user = ctx.state.claimedUser

    if (!user.verified) {
        ctx.throw(401, "Email not verified")
    }

    ctx.body = {
        access_token: createAccessToken(user),
        token_type: "Bearer",
        expires_in: ACCESS_TOKEN_EXPIRES,
    }
})


router.post("/auth/delete", async (ctx) => {
    await handleRateLimit(ctx, 1)

    if (!ctx.user) {
        ctx.throw(401, "Unauthorized")
    }

    await prisma.user.delete({ where: { id: ctx.user.id }})

    ctx.body = {
        msg: "User deleted"
    }
})


router.post("/auth/email", async (ctx) => {
    await handleRateLimit(ctx, 10)

    if (!ctx.user) {
        ctx.throw(401, "Unauthorized")
    }

    const newEmail = ctx.request.body.email
    const password = ctx.request.body.password

    if (!checkPasswordHash(ctx.user.password, password)) {
        ctx.throw(401, "Invalid login")
    }

    await prisma.user.update({
        where: { id: ctx.user.id },
        data: {
            email: newEmail,
            verified: false
        }
    })

    const refreshToken = createRefreshToken(ctx.user)

    await sendEmail(newEmail, "EMAIL_CHANGE", {
        name: ctx.user.name,
        token: refreshToken
    })

    ctx.body = {
        msg: "Changed email, please verify now"
    }
})


router.post("/auth/password", async (ctx) => {
    await handleRateLimit(ctx, 10)

    const newPassword = ctx.request.body.new_password

    let user

    if (ctx.state.tokenType == "reset") {
        // Password reset, user followed a link from their email
        // The token is valid for only this route

        user = ctx.state.claimedUser

    } else {
        // Verify that the user specified their old password
        // before allowing them to change it without proving email access

        const oldPassword = ctx.request.body.password

        if (!oldPassword) {
            ctx.throw(401, "Specify previous password")
        }

        if (!checkPasswordHash(ctx.user.password, oldPassword)) {
            ctx.throw(401, "Invalid login")
        }

        // They should have sent us their actual token
        user = ctx.user
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { password: generatePasswordHash(newPassword) }
    })

    ctx.body = {
        msg: "Password changed successfully",
        email: user.email
    }
})


router.post("/auth/reset", async (ctx) => {
    await handleRateLimit(ctx, 40)

    const email = ctx.request.body.email

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
        ctx.throw(400, "Email not found")
    }

    if (!user.verified) {
        await prisma.user.delete({ where: { id: user.id }})
        ctx.throw(400, "Email not verified")
    }

    const resetToken = createRefreshToken(user, "reset")

    await sendEmail(user.email, "RESET_PASSWORD", {
        name: user.name,
        token: resetToken
    })

    ctx.body = {
        msg: "Please check email for verification link"
    }
})


router.get("/auth/status", async (ctx) => {
    if (!ctx.user) {
        ctx.throw(401, "Unauthorized")
    }

    ctx.body = {
        name: ctx.user.name,
        email: ctx.user.email,
        registered_on: ctx.user.registered_on,
        id: ctx.user.id.toString()
    }
})

module.exports = router
