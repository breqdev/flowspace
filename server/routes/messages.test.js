const request = require("supertest")

const app = require("../index.js")

const { loginUser } = require("../conftest/utils")
const prisma = require("../utils/prisma")

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

describe("get messages", () => {
    it("returns 404 for a nonexistent user", async () => {
        const { token } = await loginUser()
        const res = await getMessages("-1", token)
        expect(res.status).toBe(404)
    })

    it("returns 404 if users have no mutual relationship", async () => {
        const { token } = await loginUser({ email: "from@example.com" })
        const { id: toId } = await loginUser({ email: "to@example.com" })

        const res = await getMessages(toId, token)
        expect(res.status).toBe(404)
    })

    it("returns 404 if there is no outgoing relationship", async () => {
        const { token: fromToken, id: fromId } = await loginUser({ email: "from@example.com" })
        const { token: toToken, id: toId } = await loginUser({ email: "to@example.com" })

        await createRelationship(fromId, toToken, "FOLLOW")

        const res = await getMessages(toId, fromToken)
        expect(res.status).toBe(404)
    })

    it("returns 404 if there is no incoming relationship", async () => {
        const { token: fromToken } = await loginUser({ email: "from@example.com" })
        const { id: toId } = await loginUser({ email: "to@example.com" })

        await createRelationship(toId, fromToken, "FOLLOW")

        const res = await getMessages(toId, fromToken)
        expect(res.status).toBe(404)
    })

    it("returns an empty response if a relationship is present but no messages", async () => {
        const { id: fromId, token: fromToken } = await loginUser({ email: "from@example.com" })
        const { id: toId, token: toToken } = await loginUser({ email: "to@example.com" })

        await createRelationship(fromId, toToken, "FOLLOW")
        await createRelationship(toId, fromToken, "FOLLOW")

        const res = await getMessages(toId, fromToken)
        expect(res.status).toBe(200)
        expect(res.body).toEqual([])
    })

    it("returns a message if one has been sent", async () => {
        const { fromId, fromToken, toId, toToken } = await createMutualRelationship()

        await sendMessage(toId, fromToken, "Hello")

        const res = await getMessages(fromId, toToken)
        expect(res.status).toBe(200)
        expect(res.body.length).toBe(1)
        expect(res.body[0].content).toBe("Hello")
    })

    it("returns multiple messages ordered from oldest to newest", async () => {
        const { fromId, fromToken, toId, toToken } = await createMutualRelationship()

        await sendMessage(toId, fromToken, "Hello")
        await sendMessage(toId, fromToken, "World")

        const res = await getMessages(fromId, toToken)
        expect(res.status).toBe(200)
        expect(res.body.length).toBe(2)
        expect(res.body[0].content).toBe("Hello")
        expect(res.body[1].content).toBe("World")
    })
})

describe("send message", () => {
    it("does not allow sending messages if a relationship is not present", async () => {
        const { token: fromToken } = await loginUser({ email: "from@example.com" })
        const { id: toId } = await loginUser({ email: "to@example.com" })

        await createRelationship(toId, fromToken, "FOLLOW")

        const res = await sendMessage(toId, fromToken, "Hello")

        expect(res.status).toBe(404)
    })

    it("does not allow sending messages to a user that has blocked us", async () => {
        const { token: fromToken, id: fromId } = await loginUser({ email: "from@example.com" })
        const { token: toToken, id: toId } = await loginUser({ email: "to@example.com" })

        await createRelationship(fromId, toToken, "BLOCK")

        const res = await sendMessage(toId, fromToken, "Hello")

        expect(res.status).toBe(404)

        // Ensure that the blocked user doesn't receive our message
        const messages = await getMessages(fromId, toToken)
        expect(messages.status).toBe(404)
    })

    it("allows sending messages to a user with a mutual relationship", async () => {
        const { fromToken, toId } = await createMutualRelationship()

        const res = await sendMessage(toId, fromToken, "Hello")
        expect(res.status).toBe(200)
    })

    it("does not create a new channel if one already exists", async () => {
        const { fromId, fromToken, toId, toToken } = await createMutualRelationship()
        expect(await prisma.channel.count()).toBe(0)

        await sendMessage(toId, fromToken, "Hello")
        expect(await prisma.channel.count()).toBe(1)

        await sendMessage(toId, fromToken, "World")
        expect(await prisma.channel.count()).toBe(1)

        await sendMessage(fromId, toToken, "Hi")
        expect(await prisma.channel.count()).toBe(1)
    })
})
