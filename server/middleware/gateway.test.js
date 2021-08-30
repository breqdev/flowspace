const WebSocket = require("ws")

const app = require("../index.js")

const { loginUser } = require("../conftest/utils")

describe("websocket gateway", () => {
    let server

    beforeEach(async () => {
        server = app.listen()
    })

    afterEach(async () => {
        await server.close()
    })

    it("rejects connections from users that are not logged in", async () => {
        const ws = new WebSocket(`ws://localhost:${server.address().port}/gateway`)

        await new Promise((resolve, reject) => {
            // Yes, this is backwards... Remember, we *want* the socket to
            // reject connections for this test case.
            ws.on("open", reject)
            ws.on("error", resolve)
        })

        ws.terminate()
    })

    it("accepts connections when a valid token is provided", async () => {
        const { token } = await loginUser()

        const ws = new WebSocket(`ws://localhost:${server.address().port}/gateway`, {
            headers: {
                authorization: `Bearer ${token}`,
            },
        })

        await new Promise((resolve, reject) => {
            ws.on("open", resolve)
            ws.on("error", reject)
        })

        ws.terminate()
    })
})
