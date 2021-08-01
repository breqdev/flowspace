const prisma = require("../utils/prisma")


describe("test database environment", () => {
    it("creates a working database connection", async () => {
        await prisma.user.create({
            data: {
                id: 100,

                email: "test@example.com",
                password: "algorithm$salt$hash",
                registeredOn: new Date(),

                name: "Test User"
            }
        })

        const user = await prisma.user.findUnique({ where: { email: "test@example.com" } })

        expect(user.email).toBe("test@example.com")
    })

    it("is a database isolated from other tests", async () => {
        const user = await prisma.user.findUnique({ where: { email: "test@example.com" } })

        expect(user).toBe(null)
    })

    it("accesses all model types without issues", async () => {
        const models = ["user", "userRelationship"]

        await Promise.all(models.map(async (model) => {
            const modelType = prisma[model]

            await modelType.findMany()
        }))
    })

    it("accesses all model types without issues a second time", async () => {
        const models = ["user", "userRelationship"]

        await Promise.all(models.map(async (model) => {
            const modelType = prisma[model]

            await modelType.findMany()
        }))
    })
})