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

        for (let i = 0; i < 100; i++) {
            await request(app.callback())
                .get("/")
        }

        const response = await request(app.callback())
            .get("/")

        expect(response.statusCode).toBe(429)
    })

    it("resets the count after the hour is over", async () => {
        jest.useFakeTimers()
        jest.setSystemTime(new Date("2020-01-01 00:00:00"))

        process.env.DISABLE_RATE_LIMITING = "false"

        for (let i = 0; i < 100; i++) {
            await request(app.callback())
                .get("/")
        }

        const response = await request(app.callback())
            .get("/")

        expect(response.statusCode).toBe(429)

        // interval is still 0
        // but it's the next hour
        // so the redis keys should be expired
        // (this only works because we mock Redis completely)

        jest.setSystemTime(new Date("2020-01-01 01:00:00"))

        const response2 = await request(app.callback())
            .get("/")

        expect(response2.statusCode).toBe(200)
    })

    it("has separate quotas for different tokens", async () => {
        const evilUser = await loginUser({ email: "evil@thesatanictemple.com" })
        const goodUser = await loginUser({ email: "good@example.com" })

        process.env.DISABLE_RATE_LIMITING = "false"

        for (let i = 0; i < 100; i++) {
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

        for (let i = 0; i < 100; i++) {
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

        for (let i = 0; i < 100; i++) {
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

        for (let i = 0; i < 100; i++) {
            await request(app.callback())
                .get("/")
                .set("X-Forwarded-For", "666:666:420:420::1")
        }

        const response = await request(app.callback())
            .get("/")
            .set("X-Forwarded-For", "666:666:420:420::2")

        expect(response.statusCode).toBe(429)
    })

    it("adds headers to the response", async () => {
        jest.useFakeTimers()

        const startDate = new Date("1970-01-02")
        const endDate = new Date(startDate.getTime() + 60 * 1000)

        jest.setSystemTime(startDate)

        process.env.DISABLE_RATE_LIMITING = "false"

        const response = await request(app.callback())
            .get("/")

        expect(response.headers["x-ratelimit-limit"]).toBe("100")
        expect(response.headers["x-ratelimit-remaining"]).toBe("99")
        expect(response.headers["x-ratelimit-reset"]).toBe((endDate.getTime() / 1000).toString())
        expect(response.headers["x-ratelimit-reset-after"]).toBe("60")
    })
})