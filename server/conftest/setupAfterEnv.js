jest.mock("../utils/email", () => jest.fn())
jest.mock("ioredis", () => require("ioredis-mock/jest"))

const prisma = require("../utils/prisma")

const redis = require("../utils/redis")

beforeEach(async () => {

    // NOTE: We need to delete these tables in this order
    // or we will have orphaned userRelationship records
    const models = ["userRelationship", "message", "channel", "user"]

    for (let model of models) {
        await prisma[model].deleteMany()
    }

    await redis.flushdb()
})

afterEach(() => {
    jest.clearAllMocks();
})

afterAll(async () => {
    await redis.quit()
})
