import { encode, decode } from "./bigintToBase64"

describe("bigint to base64", () => {
    it("encodes and decodes consistently", async () => {
        const bigint = BigInt(1)
        const base64 = encode(bigint)
        const bigint2 = decode(base64)
        expect(bigint).toEqual(bigint2)
    })

    it("encodes and decodes with URL safe hyphen instead of plus", async () => {
        const bigint = BigInt(992)
        const base64 = encode(bigint)

        expect(base64).toContain("-")
        expect(base64).not.toContain("+")

        const bigint2 = decode(base64)
        expect(bigint).toEqual(bigint2)
    })

    it("encodes and decodes with url safe underscore instead of slash", async () => {
        const bigint = BigInt(1008)
        const base64 = encode(bigint)

        expect(base64).toContain("_")
        expect(base64).not.toContain("/")

        const bigint2 = decode(base64)
        expect(bigint).toEqual(bigint2)
    })

    it("does not include padding when encoding", async () => {
        const bigint = BigInt(1)
        const base64 = encode(bigint)
        expect(base64).not.toContain("=")
    })
})
