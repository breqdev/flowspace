const request = require("supertest")

const app = require("../index.js")

const { loginUser } = require("../testUtils/auth")
const { getClientIP, MAX_REQUESTS } = require("./rateLimit")


describe("get client IP", () => {
    const OLD_ENV = process.env

    beforeEach(() => {
        process.env = { ...OLD_ENV }
    })

    afterAll(() => {
        process.env = OLD_ENV
    })

    it("returns the raw incoming IP when not behind a proxy", async () => {
        process.env.TRUSTED_PROXIES = "0"

        //      spoofed:    5.6.7.8
        // REAL source IP:  1.2.3.4

        const ip = getClientIP({
            ip: "1.2.3.4",
            xff: "5.6.7.8"
        })

        expect(ip).toBe("1.2.3.4")
    })

    it("reads the last entry of XFF when behind one proxy", async () => {
        process.env.TRUSTED_PROXIES = "1"

        //      spoofed:    9.10.11.12
        // REAL source IP:  5.6.7.8
        //      via proxy:  1.2.3.4

        const ip = getClientIP({
            ip: "1.2.3.4",
            xff: "9.10.11.12, 5.6.7.8"
        })

        expect(ip).toBe("5.6.7.8")
    })

    it("reads the correct entry of XFF when behind multiple proxies", async () => {
        process.env.TRUSTED_PROXIES = "3"

        //      spoofed:    21.22.23.24
        //      spoofed:    17.18.19.20
        // REAL source IP:  13.14.15.16
        //      via proxy:  5.6.7.8
        //      via proxy:  9.10.11.12
        //      via proxy:  1.2.3.4

        const ip = getClientIP({
            ip: "1.2.3.4",
            xff: "21.22.23.24, 17.18.19.20, 13.14.15.16, 9.10.11.12, 5.6.7.8"
        })

        expect(ip).toBe("13.14.15.16")
    })
})

describe("global ratelimit middleware", () => {
    const OLD_ENV = process.env

    beforeEach(() => {
        process.env = { ...OLD_ENV }

        jest.useFakeTimers()
        jest.setSystemTime(new Date(Date.now()))
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

    it("allows up to the limit of requests", async () => {
        process.env.DISABLE_RATE_LIMITING = "false"

        for (let i = 0; i < MAX_REQUESTS - 1; i++) {
            await request(app.callback())
                .get("/")
        }

        const response = await request(app.callback())
            .get("/")

        expect(response.statusCode).toBe(200)
    })

    it("blocks more than MAX_REQUESTS requests in one minute", async () => {
        process.env.DISABLE_RATE_LIMITING = "false"

        for (let i = 0; i < MAX_REQUESTS; i++) {
            await request(app.callback())
                .get("/")
        }

        const response = await request(app.callback())
            .get("/")

        expect(response.statusCode).toBe(429)
    })

    it("resets the count after the hour is over", async () => {
        jest.setSystemTime(new Date("2020-01-01 00:00:00"))

        process.env.DISABLE_RATE_LIMITING = "false"

        for (let i = 0; i < MAX_REQUESTS; i++) {
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

        for (let i = 0; i < MAX_REQUESTS; i++) {
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
        process.env.TRUSTED_PROXIES = "1"

        for (let i = 0; i < MAX_REQUESTS; i++) {
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
        process.env.TRUSTED_PROXIES = "1"

        for (let i = 0; i < MAX_REQUESTS; i++) {
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
        process.env.TRUSTED_PROXIES = "1"

        for (let i = 0; i < MAX_REQUESTS; i++) {
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
        const startDate = new Date("1970-01-02")
        const endDate = new Date(startDate.getTime() + 60 * 1000)

        jest.setSystemTime(startDate)

        process.env.DISABLE_RATE_LIMITING = "false"

        const response = await request(app.callback())
            .get("/")

        expect(response.headers["x-ratelimit-limit"]).toBe(String(MAX_REQUESTS))
        expect(response.headers["x-ratelimit-remaining"]).toBe(String(MAX_REQUESTS - 1))
        expect(response.headers["x-ratelimit-reset"]).toBe((endDate.getTime() / 1000).toString())
        expect(response.headers["x-ratelimit-reset-after"]).toBe("60")
    })
})
