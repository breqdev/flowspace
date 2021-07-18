const prisma = require("../utils/prisma")


describe("set up isolated databases for test cases", () => {
    it("creates a working database connection", async () => {
        await prisma.user.create({
            data: {
                id: 0n,

                email: "test@example.com",
                password: "algorithm$salt$hash",
                registeredOn: new Date(),

                name: "Test User"
            }
        })

        const user = await prisma.user.findUnique({ where: { email: "test@example.com" } })

        expect(user.id).toBe(0n)
    })
})