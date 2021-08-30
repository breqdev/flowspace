const WebSocket = require("ws")

const app = require("../index.js")

const { loginUser, createMutualRelationship, sendMessage } = require("../conftest/utils")


const timeoutPromise = (timeout, callback, error) => {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(`Promise timed out after ${timeout} ms: ${error}`))
        }, timeout)

        callback(
            (value) => {
                clearTimeout(timer)
                resolve(value)
            },
            (error) => {
                clearTimeout(timer)
                reject(error)
            }
        )
    })
}


describe("websocket gateway", () => {
    let server

    const getWebsocket = async (token) => {
        const ws = new WebSocket(`ws://localhost:${server.address().port}/gateway`, {
            headers: {
                authorization: `Bearer ${token}`,
            },
        })

        await new Promise((resolve, reject) => {
            ws.on("open", resolve)
            ws.on("error", reject)
        })

        ws.on("error", console.error)

        return ws
    }

    const getNextMessage = (ws) => {
        const callback = (resolve) => {
            ws.once("message", (message) => {
                resolve(JSON.parse(message))
            })
        }

        return timeoutPromise(2000, callback, "Waiting for message")
    }

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

        const ws = await getWebsocket(token)
        ws.terminate()
    })

    it("allows subscribing to direct message events", async () => {
        const { fromId, fromToken, toId, toToken } = await createMutualRelationship()

        const ws = await getWebsocket(fromToken)
        ws.send(JSON.stringify({
            type: "SUBSCRIBE",
            target: "MESSAGES_DIRECT",
            user: toId,
        }))

        const message = await getNextMessage(ws)
        expect(message.type).toBe("SUBSCRIBED")

        let nextMessage = getNextMessage(ws)

        await sendMessage(fromId, toToken, "Hello, world!")

        nextMessage = await nextMessage
        expect(nextMessage.type).toBe("MESSAGES_DIRECT")
        expect(nextMessage.data.content).toBe("Hello, world!")

        ws.terminate()
    })
})
