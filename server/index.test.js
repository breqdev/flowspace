const request = require("supertest")

const app = require("./index.js")
const prisma = require("./utils/prisma")

test("root", async () => {
    const response = await request(app.callback()).get("/")
    expect(response).toBeDefined()
})


afterAll(async () => {
    prisma.$disconnect()
})