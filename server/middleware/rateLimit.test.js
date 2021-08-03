const request = require("supertest")

const app = require("../index.js")

const { loginUser } = require("../conftest/utils")

describe("global ratelimit middleware", () => {
    const OLD_ENV = process.env

    beforeEach(() => {
        process.env = { ...OLD_ENV }
    })

    afterAll(() => {
        process.env = OLD_ENV
    })

    afterEach(() => {
        jest.clearAllMocks()
        jest.useRealTimers()
    })

    it("allows a single request through", async () => {
        process.env.DISABLE_RATE_LIMITING = "false"

        const response = await request(app.callback())
            .get("/")

        expect(response.statusCode).toBe(200)
    })

    it("blocks more than 100 requests in one minute", async () => {
        // Set the system time constant
        jest.useFakeTimers()
        jest.setSystemTime(new Date(Date.now()))

        process.env.DISABLE_RATE_LIMITING = "false"

        for (let i = 0; i < 101; i++) {
            await request(app.callback())
                .get("/")
        }

        const response = await request(app.callback())
            .get("/")

        expect(response.statusCode).toBe(429)
    })

    it("has separate quotas for different tokens", async () => {
        const evilUser = await loginUser({ email: "evil@thesatanictemple.com" })
        const goodUser = await loginUser({ email: "good@example.com" })

        process.env.DISABLE_RATE_LIMITING = "false"

        for (let i = 0; i < 101; i++) {
            await request(app.callback())
                .get("/")
                .set("Authorization", `Bearer ${evilUser.token}`)
        }

        const response = await request(app.callback())
            .get("/")
            .set("Authorization", `Bearer ${goodUser.token}`)

        expect(response.statusCode).toBe(200)
    })

    it("has separate quotas for different IPv4 addresses", async () => {
        process.env.DISABLE_RATE_LIMITING = "false"
        process.env.BEHIND_PROXY = "true"

        for (let i = 0; i < 101; i++) {
            await request(app.callback())
                .get("/")
                .set("X-Forwarded-For", "6.6.6.6")
        }

        const response = await request(app.callback())
            .get("/")
            .set("X-Forwarded-For", "1.1.1.1")

        expect(response.statusCode).toBe(200)
    })

    it("has separate quotas for different IPv6 addresses", async () => {
        process.env.DISABLE_RATE_LIMITING = "false"
        process.env.BEHIND_PROXY = "true"

        for (let i = 0; i < 101; i++) {
            await request(app.callback())
                .get("/")
                .set("X-Forwarded-For", "666:666:420:420::1")
        }

        const response = await request(app.callback())
            .get("/")
            .set("X-Forwarded-For", "600D::1")

        expect(response.statusCode).toBe(200)
    })

    it("treats IPv6 /64 blocks as the same IP", async () => {
        process.env.DISABLE_RATE_LIMITING = "false"
        process.env.BEHIND_PROXY = "true"

        for (let i = 0; i < 101; i++) {
            await request(app.callback())
                .get("/")
                .set("X-Forwarded-For", "666:666:420:420::1")
        }

        const response = await request(app.callback())
            .get("/")
            .set("X-Forwarded-For", "666:666:420:420::2")

        expect(response.statusCode).toBe(429)
    })
})