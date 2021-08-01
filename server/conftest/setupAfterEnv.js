const exec = require("./exec")

jest.mock("../utils/email", () => jest.fn())

const prisma = require("../utils/prisma")

beforeEach(async () => {

    // NOTE: We need to delete these tables in this order
    // or we will have orphaned userRelationship records
    const models = ["userRelationship", "user"]

    for (let model of models) {
        await prisma[model].deleteMany()
    }
})

afterEach(() => {
    jest.clearAllMocks();
})