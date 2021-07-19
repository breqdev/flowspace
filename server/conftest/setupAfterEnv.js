const exec = require("./exec")

jest.mock("../utils/email", () => jest.fn())

beforeEach(async () => {
    await exec(`${process.env.PRISMA_BINARY} migrate reset --force`)
})

afterEach(() => {
    jest.clearAllMocks();
})