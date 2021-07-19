const request = require("supertest")

const app = require("../index.js")
const prisma = require("../utils/prisma")

const { signupUser, loginUser, verifyUser, sendEmail } = require("../conftest/utils")


const verifyToken = (token) => {
    const payload = token.split(".")[1]
    JSON.parse(Buffer.from(payload, "base64").toString())
}

const mangleSignature = (token) => (
    token.split(".").slice(0, 2).concat("NotValidSig").join(".")
)



describe("user signup", () => {
    it("allows users to sign up", async () => {
        const { response } = await signupUser()

        expect(response.statusCode).toBe(200)

        expect(sendEmail).toBeCalled()
    })

    it("does not allow users to sign up with an existing email", async () => {
        await signupUser()

        const secondUser = {
            name: "Second User",
            email: "test@example.com",
            password: "test_password"
        }

        const response = await request(app.callback())
            .post("/auth/signup")
            .type("form")
            .send(secondUser)

        expect(response.statusCode).toBe(400)

        expect(sendEmail).toBeCalledTimes(1)
    })

    it("gives users a valid token", async () => {
        await signupUser()

        const params = sendEmail.mock.calls[0][2]
        verifyToken(params.token)
    })

    it("gives users different password salts", async () => {
        /*
         * This test creates two different users with the same password
         * and then compares the password hashes stored in the database.
         *
         * It verifies that the two stored hashes are not equal.
         *
         * The salt ensures that the stored passwords are not vulnerable
         * to a precomputation attack, in which an attacker uses a precomputed
         * table mapping dictionary words to their hashes in order to quickly
         * reverse a bare password hashes.
         *
         * Ensuring the salt's uniqueness also protects users. This way, if an
         * attacker gains access to the database, they can't figure out which
         * users share the same password by looking for duplicates in the
         * hashes.
         */
        await signupUser({ email: "first@example.com" })
        await signupUser({ email: "second@example.com" })

        const firstUser = await prisma.user.findUnique({ where: { email: "first@example.com"} })
        const secondUser = await prisma.user.findUnique({ where: { email: "second@example.com"} })

        const firstPassword = firstUser.password.split("$")
        const secondPassword = secondUser.password.split("$")

        expect(firstPassword[0]).toBe(secondPassword[0]) // Algorithm (sha256)
        expect(firstPassword[1]).not.toBe(secondPassword[1]) // Salt
        expect(firstPassword[2]).not.toBe(secondPassword[2]) // Hash
    })
})

describe("email verification", () => {
    it("verifies email after signup", async () => {
        const { response } = await verifyUser()

        expect(response.statusCode).toBe(200)

        verifyToken(response.body.access_token)
    })

    it("verifies email after email change", async () => {
        const { user, token } = await verifyUser()

        await request(app.callback())
            .post("/auth/email")
            .set("Authorization", `Bearer ${token}`)
            .send({
                email: "new_email@example.com",
                password: user.password
            })

        const params = sendEmail.mock.calls[0][2]

        const response = await request(app.callback())
            .post("/auth/verify")
            .set("Authorization", `Bearer ${params.token}`)

        expect(response.statusCode).toBe(200)
        verifyToken(response.body.access_token)
    })
})

describe("user login", () => {
    it("allows users to login", async () => {
        const { response } = await loginUser()

        expect(response.statusCode).toBe(200)

        verifyToken(response.body.access_token)
        verifyToken(response.body.refresh_token)
    })

    it("rejects incorrect passwords", async () => {
        const { user } = await verifyUser()

        const response = await request(app.callback())
            .post("/auth/login")
            .type("form")
            .send({ email: user.email, password: "incorrect_password" })

        expect(response.statusCode).toBe(401)
    })

    it("rejects incorrect emails", async () => {
        const { user } = await verifyUser()

        const response = await request(app.callback())
            .post("/auth/login")
            .type("form")
            .send({ email: "incorrect_email", password: user.password })

        expect(response.statusCode).toBe(401)
    })
})

describe("token refresh", () => {
    it("gives a new access token for a valid refresh token", async () => {
        const { refresh } = await loginUser()

        const response = await request(app.callback())
            .post("/auth/refresh")
            .set("Authorization", `Bearer ${refresh}`)

        expect(response.statusCode).toBe(200)
        verifyToken(response.body.access_token)
    })

    it("rejects refresh tokens that are not valid", async () => {
        const { refresh } = await loginUser()

        const invalidRefresh = refresh.split(".").slice(0, 2).concat("NotValidSig").join(".")

        const response = await request(app.callback())
            .post("/auth/refresh")
            .set("Authorization", `Bearer ${invalidRefresh}`)

        expect(response.statusCode).toBe(401)
    })
})

describe("email change", () => {
    it("allows users to change their email", async () => {
        const { user, token } = await loginUser()

        user.email = "new_email@example.com"

        const change = await request(app.callback())
            .post("/auth/email")
            .set("Authorization", `Bearer ${token}`)
            .send({ email: user.email, password: user.password })

        expect(change.statusCode).toBe(200)

        const params = sendEmail.mock.calls[0][2]

        const verify = await request(app.callback())
            .post("/auth/verify")
            .set("Authorization", `Bearer ${params.token}`)

        expect(verify.statusCode).toBe(200)

        const login = await request(app.callback())
            .post("/auth/login")
            .type("form")
            .send({ email: user.email, password: user.password })

        expect(login.statusCode).toBe(200)
        verifyToken(login.body.access_token)

        const status = await request(app.callback())
            .get("/auth/status")
            .set("Authorization", `Bearer ${token}`)

        expect(status.statusCode).toBe(200)
        expect(status.body.email).toBe(user.email)
    })

    it("rejects incorrect passwords", async () => {
        const { user, token } = await loginUser()

        user.email = "new_email@example.com"

        const response = await request(app.callback())
            .post("/auth/email")
            .set("Authorization", `Bearer ${token}`)
            .type("form")
            .send({ email: user.email, password: "incorrect_password" })

        expect(response.statusCode).toBe(401)
    })
})

describe("password change and reset", () => {
    it("allows setting new password by providing old password", async () => {
        const { user, token } = await loginUser()

        const response = await request(app.callback())
            .post("/auth/password")
            .set("Authorization", `Bearer ${token}`)
            .type("form")
            .send({ new_password: "new_password", password: user.password })

        expect(response.statusCode).toBe(200)

        const login = await request(app.callback())
            .post("/auth/login")
            .type("form")
            .send({ email: user.email, password: "new_password" })

        expect(login.statusCode).toBe(200)
        verifyToken(login.body.access_token)
    })

    it("rejects incorrect old passwords", async () => {
        const { token } = await loginUser()

        const response = await request(app.callback())
            .post("/auth/password")
            .set("Authorization", `Bearer ${token}`)
            .type("form")
            .send({ new_password: "new_password", password: "incorrect" })

        expect(response.statusCode).toBe(401)
    })

    it("allows setting new password by proving email access", async () => {
        const { user } = await loginUser()

        const reset = await request(app.callback())
            .post("/auth/reset")
            .type("form")
            .send({ email: user.email })

        expect(reset.statusCode).toBe(200)

        // We access the *second* email, since the first email
        // has the refresh token sent during the signup/verify process.
        const { token } = sendEmail.mock.calls[1][2]

        const response = await request(app.callback())
            .post("/auth/password")
            .set("Authorization", `Bearer ${token}`)
            .type("form")
            .send({ new_password: "new_password" })

        expect(response.statusCode).toBe(200)

        const login = await request(app.callback())
            .post("/auth/login")
            .type("form")
            .send({ email: user.email, password: "new_password" })

        expect(login.statusCode).toBe(200)
        verifyToken(login.body.access_token)
    })

    it("rejects non-reset tokens", async () => {
        const { token } = await loginUser()

        const response = await request(app.callback())
            .post("/auth/password")
            .set("Authorization", `Bearer ${token}`)
            .type("form")
            .send({ new_password: "new_password" })

        expect(response.statusCode).toBe(401)
    })
})

describe("query user authentication", () => {
    it("returns 401 when not logged in", async () => {
        const response = await request(app.callback()).get("/auth/status")
        expect(response.statusCode).toBe(401)
    })

    it("returns 401 for invalid tokens", async () => {
        const { token } = await loginUser()

        const invalidToken = mangleSignature(token)

        const response = await request(app.callback())
            .post("/auth/status")
            .set("Authorization", `Bearer ${invalidToken}`)

        expect(response.statusCode).toBe(401)
    })

    it("returns 401 for refresh tokens", async () => {
        const { refresh } = await loginUser()

        const response = await request(app.callback())
            .get("/auth/status")
            .set("Authorization", `Bearer ${refresh}`)

        expect(response.statusCode).toBe(401)
    })

    it("returns 401 for password reset tokens", async () => {
        const { user } = await loginUser()

        const reset = await request(app.callback())
            .post("/auth/reset")
            .type("form")
            .send({ email: user.email })

        expect(reset.statusCode).toBe(200)

        const token = sendEmail.mock.calls[0][2]

        const response = await request(app.callback())
            .get("/auth/status")
            .set("Authorization", `Bearer ${token}`)

        expect(response.statusCode).toBe(401)
    })

    it("returns 200 when logged in", async () => {
        const { token } = await loginUser()

        const response = await request(app.callback())
            .get("/auth/status")
            .set("Authorization", `Bearer ${token}`)

        expect(response.statusCode).toBe(200)
    })
})

describe("account deletion", () => {
    it("allows logged in users to delete their account", async () => {
        const { user, token } = await loginUser()

        const response = await request(app.callback())
            .post("/auth/delete")
            .set("Authorization", `Bearer ${token}`)

        expect(response.statusCode).toBe(200)

        const dbUser = await prisma.user.findUnique({ where: { email: user.email }})

        expect(dbUser).toBe(null)
    })

    it("does not allow deleting accounts without a valid token", async () => {
        const { user, token } = await loginUser()

        const response = await request(app.callback())
            .post("/auth/delete")
            .set("Authorization", `Bearer ${mangleSignature(token)}`)

        expect(response.statusCode).toBe(401)

        const dbUser = await prisma.user.findUnique({ where: { email: user.email }})

        expect(dbUser).not.toBe(null)
    })
})
