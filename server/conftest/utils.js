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

const createRelationship = async (toId, token, type) => {
    return await request(app.callback())
        .post("/relationship/outgoing/" + toId)
        .set("Authorization", `Bearer ${token}`)
        .send({ type })
}

const createMutualRelationship = async () => {
    const { id: fromId, token: fromToken } = await loginUser({ email: "from@example.com" })
    const { id: toId, token: toToken } = await loginUser({ email: "to@example.com" })

    await createRelationship(toId, fromToken, "WAVE")
    await createRelationship(fromId, toToken, "WAVE")

    return { fromId, fromToken, toId, toToken }
}

const getMessages = async (fromId, token) => {
    return await request(app.callback())
        .get(`/messages/direct/${fromId}`)
        .set("Authorization", `Bearer ${token}`)
}

const sendMessage = async (toId, token, content) => {
    return await request(app.callback())
        .post(`/messages/direct/${toId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ content })
}

module.exports = {
    signupUser,
    verifyUser,
    loginUser,
    sendEmail,
    createRelationship,
    createMutualRelationship,
    getMessages,
    sendMessage
}