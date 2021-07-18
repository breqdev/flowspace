const exec = require("./exec")

beforeEach(async () => {
    await exec(`${process.env.PRISMA_BINARY} migrate reset --force`)
})