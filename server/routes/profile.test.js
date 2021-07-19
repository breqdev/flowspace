const request = require("supertest")

const app = require("../index.js")

const { loginUser } = require("../conftest/utils")

describe("get own profile", () => {
    it("returns the logged-in user's profile", async () => {
        const { user, token } = await loginUser()

        const response = await request(app.callback())
            .get("/profile/@me")
            .set("Authorization", `Bearer ${token}`)

        expect(response.statusCode).toBe(200)
        expect(response.body.name).toBe(user.name)
    })

    it("rejects users that are not logged in", async () => {
        const response = await request(app.callback())
            .get("/profile/@me")

        expect(response.statusCode).toBe(401)
    })
})

describe("set profile", () => {
    it("updates the logged-in user's profile", async () => {
        const { token } = await loginUser()

        const response = await request(app.callback())
            .post("/profile/@me")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "New Name"
            })

        expect(response.statusCode).toBe(200)

        const profile = await request(app.callback())
            .get("/profile/@me")
            .set("Authorization", `Bearer ${token}`)

        expect(profile.body.name).toBe("New Name")
    })

    it("rejects users that are not logged in", async () => {
        const response = await request(app.callback())
            .post("/profile/@me")
            .send({
                name: "New Name"
            })

        expect(response.statusCode).toBe(401)
    })

    it("leaves non-specified fields unchanged", async () => {
        const { user, token } = await loginUser()

        const response = await request(app.callback())
            .post("/profile/@me")
            .set("Authorization", `Bearer ${token}`)
            .send({
                pronouns: "she/her"
            })

        expect(response.statusCode).toBe(200)

        const profile = await request(app.callback())
            .get("/profile/@me")
            .set("Authorization", `Bearer ${token}`)

        expect(profile.body.pronouns).toBe("she/her")
        expect(profile.body.name).toBe(user.name)
    })

    it("doesn't remove optional fields that aren't specified", async () => {
        const { token } = await loginUser()

        // Set an optional field (in this case, bio)
        await request(app.callback())
            .post("/profile/@me")
            .set("Authorization", `Bearer ${token}`)
            .send({
                bio: "I exist for the sake of testing"
            })

        // Now, send another request, leaving the optional field undefined
        await request(app.callback())
            .put("/profile/@me")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "New Name"
            })

        // Verify that the bio is still there
        const profile = await request(app.callback())
            .get("/profile/@me")
            .set("Authorization", `Bearer ${token}`)

        expect(profile.body.bio).toBe("I exist for the sake of testing")
    })

    it("clears an optional field when 'null' is sent", async () => {
        const { token } = await loginUser()

        // Set an optional field (in this case, bio)
        await request(app.callback())
            .post("/profile/@me")
            .set("Authorization", `Bearer ${token}`)
            .send({
                bio: "I exist for the sake of testing"
            })

        // Now, send another request, sending null for the field
        await request(app.callback())
            .post("/profile/@me")
            .set("Authorization", `Bearer ${token}`)
            .send({
                bio: null
            })

        // Verify that the bio is now null
        const profile = await request(app.callback())
            .get("/profile/@me")
            .set("Authorization", `Bearer ${token}`)

        expect(profile.body.bio).toBe(null)
    })
})

describe("get profile by id", () => {
    it("allows users to get their own profile", async () => {
        const { user, token } = await loginUser()

        const profile = await request(app.callback())
            .get("/profile/@me")
            .set("Authorization", `Bearer ${token}`)

        const id = profile.body.id

        const response = await request(app.callback())
            .get(`/profile/${id}`)
            .set("Authorization", `Bearer ${token}`)

        expect(response.statusCode).toBe(200)
        expect(response.body.name).toBe(user.name)
    })

    it("allows users to get other users' profiles", async () => {
        const {
            user: viewer,
            token: viewerToken
        } = await loginUser({ email: "viewer@example.com" })

        const {
            user: target,
            token: targetToken
        } = await loginUser()

        const targetOwnProfile = await request(app.callback())
            .get("/profile/@me")
            .set("Authorization", `Bearer ${targetToken}`)

        const targetId = targetOwnProfile.body.id

        const response = await request(app.callback())
            .get(`/profile/${targetId}`)
            .set("Authorization", `Bearer ${viewerToken}`)

        expect(response.statusCode).toBe(200)
        expect(response.body.name).toBe(target.name)
    })

    it("returns 404 for nonexistent profiles", async () => {
        const { token } = await loginUser()

        const response = await request(app.callback())
            .get("/profile/123")
            .set("Authorization", `Bearer ${token}`)

        expect(response.statusCode).toBe(404)
    })
})
