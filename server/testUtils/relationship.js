const request = require("supertest")

const app = require("../index.js")

const { loginUser } = require("./auth")

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


module.exports = {
    createRelationship,
    createMutualRelationship
}
