const request = require("supertest")

const app = require("../index.js")

describe("query user authentication", () => {
    it("returns 401 when not logged in", async () => {
        const response = await request(app.callback()).get("/auth/status")
        expect(response.statusCode).toBe(401)
    })
})