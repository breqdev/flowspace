const request = require("supertest")

const app = require("../index.js")

const { loginUser } = require("../conftest/utils")

const createRelationship = async (toId, token, type) => {
    return await request(app.callback())
        .post("/relationship/outgoing/" + toId)
        .set("Authorization", `Bearer ${token}`)
        .send({ type })
}

const getOutgoingRelationship = async (toId, token) => {
    return await request(app.callback())
        .get("/relationship/outgoing/" + toId)
        .set("Authorization", `Bearer ${token}`)
}

const getIncomingRelationship = async (fromId, token) => {
    return await request(app.callback())
        .get("/relationship/incoming/" + fromId)
        .set("Authorization", `Bearer ${token}`)
}

describe("set outgoing relationship", () => {
    it("allows users to wave to another user", async () => {
        const { token } = await loginUser({ email: "from@example.com" })
        const { id: toId } = await loginUser({ email: "to@example.com" })

        const res = await createRelationship(toId, token, "WAVE")

        expect(res.status).toBe(200)
    })

    it("allows users to follow another user", async () => {
        const { token } = await loginUser({ email: "from@example.com" })
        const { id: toId } = await loginUser({ email: "to@example.com" })

        const res = await createRelationship(toId, token, "FOLLOW")

        expect(res.status).toBe(200)
    })

    it("allows users to block another user", async () => {
        const { token } = await loginUser({ email: "from@example.com" })
        const { id: toId } = await loginUser({ email: "to@example.com" })

        const res = await createRelationship(toId, token, "BLOCK")

        expect(res.status).toBe(200)
    })

    it("rejects invalid relationship types", async () => {
        const { token } = await loginUser({ email: "from@example.com" })
        const { id: toId } = await loginUser({ email: "to@example.com" })

        const res = await createRelationship(toId, token, "INVALID")

        expect(res.status).toBe(400)
    })

    it("updates existing relationships", async () => {
        const { token } = await loginUser({ email: "from@example.com" })
        const { id: toId } = await loginUser({ email: "to@example.com" })

        await createRelationship(toId, token, "WAVE")

        const postRes = await createRelationship(toId, token, "FOLLOW")

        expect(postRes.status).toBe(200)

        const getRes = await getOutgoingRelationship(toId, token)

        expect(getRes.status).toBe(200)
        expect(getRes.body.type).toBe("FOLLOW")
    })

    it("deletes existing relationships", async () => {
        const { token } = await loginUser({ email: "from@example.com" })
        const { id: toId } = await loginUser({ email: "to@example.com" })

        await createRelationship(toId, token, "WAVE")

        const postRes = await createRelationship(toId, token, "NONE")

        expect(postRes.status).toBe(200)

        const getRes = await getOutgoingRelationship(toId, token)

        expect(getRes.status).toBe(200)
        expect(getRes.body.type).toBe("NONE")
    })

    it("handles deleting nonexistant relationships", async () => {
        const { token } = await loginUser({ email: "from@example.com" })
        const { id: toId } = await loginUser({ email: "to@example.com" })

        const postRes = await createRelationship(toId, token, "NONE")

        expect(postRes.status).toBe(200)

        const getRes = await getOutgoingRelationship(toId, token)

        expect(getRes.status).toBe(200)
        expect(getRes.body.type).toBe("NONE")
    })

    it("returns 404 for invalid users", async () => {
        const { token } = await loginUser({ email: "from@example.com" })

        const postRes = await createRelationship("12345", token, "NONE")

        expect(postRes.status).toBe(404)
    })
})

describe("get outgoing relationship", () => {
    it("gets outgoing WAVEs", async () => {
        const { token } = await loginUser({ email: "from@example.com" })
        const { id: toId } = await loginUser({ email: "to@example.com" })

        await createRelationship(toId, token, "WAVE")

        const res = await getOutgoingRelationship(toId, token)

        expect(res.status).toBe(200)
        expect(res.body.type).toBe("WAVE")
    })

    it("gets outgoing FOLLOWs", async () => {
        const { token } = await loginUser({ email: "from@example.com" })
        const { id: toId } = await loginUser({ email: "to@example.com" })

        await createRelationship(toId, token, "FOLLOW")

        const res = await getOutgoingRelationship(toId, token)

        expect(res.status).toBe(200)
        expect(res.body.type).toBe("FOLLOW")
    })

    it("gets outgoing BLOCKs", async () => {
        const { token } = await loginUser({ email: "from@example.com" })
        const { id: toId } = await loginUser({ email: "to@example.com" })

        await createRelationship(toId, token, "BLOCK")

        const res = await getOutgoingRelationship(toId, token)

        expect(res.status).toBe(200)
        expect(res.body.type).toBe("BLOCK")
    })

    it("returns NONE for no relationship", async () => {
        const { token } = await loginUser({ email: "from@example.com" })
        const { id: toId } = await loginUser({ email: "to@example.com" })

        const res = await getOutgoingRelationship(toId, token)

        expect(res.status).toBe(200)
        expect(res.body.type).toBe("NONE")
    })
})

describe("get incoming relationship", () => {
    it("gets incoming WAVEs", async () => {
        const { id: toId, token: toToken } = await loginUser({ email: "to@example.com" })
        const { id: fromId, token: fromToken } = await loginUser({ email: "from@example.com" })

        await createRelationship(toId, fromToken, "WAVE")

        const res = await getIncomingRelationship(fromId, toToken)

        expect(res.status).toBe(200)
        expect(res.body.type).toBe("WAVE")
    })

    it("gets incoming FOLLOWs", async () => {
        const { id: toId, token: toToken } = await loginUser({ email: "to@example.com" })
        const { id: fromId, token: fromToken } = await loginUser({ email: "from@example.com" })

        await createRelationship(toId, fromToken, "FOLLOW")

        const res = await getIncomingRelationship(fromId, toToken)

        expect(res.status).toBe(200)
        expect(res.body.type).toBe("FOLLOW")
    })

    it("does not get incoming BLOCKs", async () => {
        const { id: toId, token: toToken } = await loginUser({ email: "to@example.com" })
        const { id: fromId, token: fromToken } = await loginUser({ email: "from@example.com" })

        await createRelationship(toId, fromToken, "BLOCK")

        const res = await getIncomingRelationship(fromId, toToken)

        expect(res.status).toBe(200)
        expect(res.body.type).toBe("NONE")
    })

    it("returns NONE for no relationship", async () => {
        const { token: toToken } = await loginUser({ email: "to@example.com" })
        const { id: fromId } = await loginUser({ email: "from@example.com" })

        const res = await getIncomingRelationship(fromId, toToken)

        expect(res.status).toBe(200)
        expect(res.body.type).toBe("NONE")
    })
})

describe("BLOCK restrictions", () => {
    it("does not allow incoming WAVEs when a user is blocked", async () => {
        const { id: blockerId, token: blockerToken } = await loginUser({ email: "blocker@example.com" })
        const { id: blockeeId, token: blockeeToken } = await loginUser({ email: "blockee@example.com" })

        await createRelationship(blockeeId, blockerToken, "BLOCK")

        const res = await createRelationship(blockerId, blockeeToken, "WAVE")

        expect(res.status).toBe(403)

        const relationship = await getOutgoingRelationship(blockerId, blockeeToken)
        expect(relationship.body.type).toBe("NONE")
    })

    it("does not allow incoming FOLLOWs when a user is blocked", async () => {
        const { id: blockerId, token: blockerToken } = await loginUser({ email: "blocker@example.com" })
        const { id: blockeeId, token: blockeeToken } = await loginUser({ email: "blockee@example.com" })

        await createRelationship(blockeeId, blockerToken, "BLOCK")

        const res = await createRelationship(blockerId, blockeeToken, "FOLLOW")

        expect(res.status).toBe(403)

        const relationship = await getOutgoingRelationship(blockerId, blockeeToken)
        expect(relationship.body.type).toBe("NONE")
    })

    it("does allow incoming BLOCKs when a user is blocked", async () => {
        const { id: blockerId, token: blockerToken } = await loginUser({ email: "blocker@example.com" })
        const { id: blockeeId, token: blockeeToken } = await loginUser({ email: "blockee@example.com" })

        await createRelationship(blockeeId, blockerToken, "BLOCK")

        const res = await createRelationship(blockerId, blockeeToken, "BLOCK")

        expect(res.status).toBe(200)

        const relationship = await getOutgoingRelationship(blockerId, blockeeToken)
        expect(relationship.body.type).toBe("BLOCK")
    })

    it("removes existing incoming WAVEs when a user is blocked", async () => {
        const { id: blockerId, token: blockerToken } = await loginUser({ email: "blocker@example.com" })
        const { id: blockeeId, token: blockeeToken } = await loginUser({ email: "blockee@example.com" })

        await createRelationship(blockerId, blockeeToken, "WAVE")

        const res = await createRelationship(blockeeId, blockerToken, "BLOCK")
        expect(res.status).toBe(200)

        const relationship = await getOutgoingRelationship(blockerId, blockeeToken)
        expect(relationship.body.type).toBe("NONE")
    })

    it("removes existing incoming FOLLOWs when a user is blocked", async () => {
        const { id: blockerId, token: blockerToken } = await loginUser({ email: "blocker@example.com" })
        const { id: blockeeId, token: blockeeToken } = await loginUser({ email: "blockee@example.com" })

        await createRelationship(blockerId, blockeeToken, "FOLLOW")

        const res = await createRelationship(blockeeId, blockerToken, "BLOCK")
        expect(res.status).toBe(200)

        const relationship = await getOutgoingRelationship(blockerId, blockeeToken)
        expect(relationship.body.type).toBe("NONE")
    })

    it("does not remove existing incoming BLOCKs when a user is blocked", async () => {
        const { id: blockerId, token: blockerToken } = await loginUser({ email: "blocker@example.com" })
        const { id: blockeeId, token: blockeeToken } = await loginUser({ email: "blockee@example.com" })

        await createRelationship(blockerId, blockeeToken, "BLOCK")

        const res = await createRelationship(blockeeId, blockerToken, "BLOCK")
        expect(res.status).toBe(200)

        const relationship = await getOutgoingRelationship(blockerId, blockeeToken)
        expect(relationship.body.type).toBe("BLOCK")
    })
})
