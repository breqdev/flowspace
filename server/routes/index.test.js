const request = require("supertest")

const app = require("../index.js")

test("root", async () => {
    const response = await request(app.callback()).get("/")
    expect(response.body.userCount).toBeDefined()
})