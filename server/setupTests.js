const prisma = require("./utils/prisma")

global.beforeEach(() => {
    prisma.$connect()
})

global.afterEach(() => {
    prisma.$disconnect()
})