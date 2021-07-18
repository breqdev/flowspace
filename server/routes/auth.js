const Router = require("@koa/router")

const { generatePasswordHash, checkPasswordHash } = require("../utils/hashing")
const { createAccessToken, createRefreshToken, ACCESS_TOKEN_EXPIRES } = require("../utils/createJWT")
const { sendEmail, EMAIL_TEMPLATES } = require("../utils/email")

const snowcloud = require("../utils/snowcloud")
const prisma = require("../utils/prisma")

const router = new Router()


router.post("/signup", async (ctx) => {
    const name = ctx.request.body.name
    const email = ctx.request.body.email
    const password = ctx.request.body.password

    const hash = generatePasswordHash(password)

    const existingUser = await primsa.user.findUnique({ where: { email } })

    if (existingUser) {
        ctx.throw(400, "Email already taken")
    }

    const id = snowcloud.generate()

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

    await sendEmail(user.address, EMAIL_TEMPLATES.SIGNUP, {
        name,
        token: refreshToken
    })

    return {
        msg: "Refresh token sent to email"
    }
})


router.post("/login", async (ctx) => {
    const email = ctx.request.body.email
    const password = ctx.request.body.password

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !checkPasswordHash(user.password, password)) {
        ctx.throw(401, "Invalid credentials")
    }

    if (!user.verified) {
        const refreshToken = createRefreshToken(user)

        await sendEmail(user.address, EMAIL_TEMPLATES.VERIFY_LOGIN, {
            name: user.name,
            token: refreshToken
        })

        ctx.throw(401, "Verify email first")
    }

    return {
        access_token: createAccessToken(user),
        refresh_token: createRefreshToken(user),
        token_type: "Bearer",
        expires_in: ACCESS_TOKEN_EXPIRES
    }
})


router.post("/verify", async (ctx) => {
    if (ctx.state.tokenType !== "refresh") {
        ctx.throw(401, "Invalid token")
    }

    const user = ctx.state.claimedUser

    await prisma.user.update({
        where: { id: user.id },
        data: { verified: true },
    })

    return {
        access_token: createAccessToken(user),
        token_type: "Bearer",
        expires_in: ACCESS_TOKEN_EXPIRES,
    }
})


router.post("/refresh", async (ctx) => {
    if (ctx.state.tokenType !== "refresh") {
        ctx.throw(401, "Invalid token")
    }

    const user = ctx.state.claimedUser

    if (!user.verified) {
        ctx.throw(401, "Email not verified")
    }

    return {
        access_token: createAccessToken(user),
        token_type: "Bearer",
        expires_in: ACCESS_TOKEN_EXPIRES,
    }
})


router.post("/delete", async (ctx) => {
    if (!ctx.user) {
        ctx.throw(401, "Unauthorized")
    }

    await prisma.user.delete({ where: { id: ctx.user.id }})

    return {
        msg: "User deleted"
    }
})


router.post("/email", async (ctx) => {
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

    await sendEmail(ctx.user.address, EMAIL_TEMPLATES.EMAIL_CHANGE, {
        name: ctx.user.name,
        token: refreshToken
    })

    return {
        msg: "Changed email, please verify now"
    }
})


router.post("/password", async (ctx) => {
    const newPassword = ctx.request.body.new_password

    if (ctx.state.tokenType == "reset_password") {
        // Password reset, user followed a link from their email
    } else {
        // Verify that the user specified their old password
        // before allowing them to change it without proving email access

        const oldPassword = ctx.request.body.password

        if (!checkPasswordHash(ctx.user.password, oldPassword)) {
            ctx.throw(401, "Invalid login")
        }
    }

    ctx.user.password = generatePasswordHash(newPassword)
    await prisma.user.update({
        where: { id: ctx.user.id },
        data: { password: ctx.user.password }
    })

    return {
        msg: "Password changed successfully",
        email: ctx.user.email
    }
})


router.post("/reset", async (ctx) => {
    const email = ctx.request.body.email

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
        ctx.throw(400, "Email not found")
    }

    if (!user.verified) {
        await prisma.user.delete({ where: { id: user.id }})
    }

    const refreshToken = createRefreshToken(user)

    await sendEmail(user.address, EMAIL_TEMPLATES.RESET_PASSWORD, {
        name: user.name,
        token: refreshToken
    })

    return {
        msg: "Please check email for verification link"
    }
})
