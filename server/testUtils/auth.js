const request = require("supertest")

const app = require("../index.js")
const sendEmail = require("../utils/email")

const signupUser = async (userOverride) => {
    const user = {
        name: "Test User",
        email: "test@example.com",
        password: "test_password",
        ...userOverride
    }

    const response = await request(app.callback())
        .post("/auth/signup")
        .type("form")
        .send(user)

    if (!response.ok) {
        throw new Error(response.body.msg)
    }

    return { user, response }
}

const verifyUser = async (userOverride) => {
    const { user } = await signupUser(userOverride)
    const params = sendEmail.mock.calls.slice(-1)[0][2]

    const response = await request(app.callback())
        .post("/auth/verify")
        .set("Authorization", `Bearer ${params.token}`)

    if (!response.ok) {
        throw new Error(response.body.msg)
    }

    return { user, response }
}

const loginUser = async (userOverride) => {
    const { user } = await verifyUser(userOverride)

    const response = await request(app.callback())
        .post("/auth/login")
        .type("form")
        .send({ email: user.email, password: user.password })

    if (!response.ok) {
        throw new Error(response.body.msg)
    }

    return {
        user,
        response,
        token: response.body.access_token,
        refresh: response.body.refresh_token,
        id: response.body.id
    }
}

module.exports = {
    signupUser,
    verifyUser,
    loginUser,
    sendEmail
}
