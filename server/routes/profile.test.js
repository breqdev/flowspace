const fetch = require("node-fetch")
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

    it("doesn't allow viewing the user's password hash", async () => {
        const { token } = await loginUser()

        const response = await request(app.callback())
            .get("/profile/@me")
            .set("Authorization", `Bearer ${token}`)

        expect(response.body.password).toBeUndefined()
    })

    it("doesn't allow changing the user's ID", async () => {
        const { token } = await loginUser()

        const response = await request(app.callback())
            .post("/profile/@me")
            .set("Authorization", `Bearer ${token}`)
            .send({
                id: "1234567890"
            })

        expect(response.statusCode).toBe(400)
    })

    it("doesn't allow fields beyond the length limit", async () => {
        const { token } = await loginUser()

        const response = await request(app.callback())
            .post("/profile/@me")
            .set("Authorization", `Bearer ${token}`)
            .send({
                bio: "a".repeat(2000)
            })

        expect(response.statusCode).toBe(400)
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

describe("user avatar", () => {
    it("allows users to upload their avatar", async () => {
        const { token } = await loginUser()

        const avatar = await fetch('https://avatars.githubusercontent.com/u/583231?v=4')
        const avatarBuffer = await avatar.buffer()

        const response = await request(app.callback())
            .post("/profile/avatar/@me")
            .set("Authorization", `Bearer ${token}`)
            .set("Content-Type", "multipart/form-data")
            .attach("avatar", avatarBuffer, { filename: "my_cool_avatar.png" })

        expect(response.statusCode).toBe(200)
    })

    it("returns other users' avatar hashes", async () => {
        const { token: viewerToken } = await loginUser({ email: "viewer@example.com" })

        const { id: targetId, token: targetToken } = await loginUser()

        const targetAvatar = await fetch('https://avatars.githubusercontent.com/u/583231?v=4')
        const targetAvatarBuffer = await targetAvatar.buffer()

        await request(app.callback())
            .post("/profile/avatar/@me")
            .set("Authorization", `Bearer ${targetToken}`)
            .set("Content-Type", "multipart/form-data")
            .attach("avatar", targetAvatarBuffer, { filename: "my_cool_avatar.png" })

        const response = await request(app.callback())
            .get(`/profile/${targetId}`)
            .set("Authorization", `Bearer ${viewerToken}`)

        expect(response.statusCode).toBe(200)
        expect(response.body.avatarHash).toEqual(expect.stringContaining(".png"))
    })

    it("returns other users' avatars", async () => {
        const { token: viewerToken } = await loginUser({ email: "viewer@example.com" })

        const { id: targetId, token: targetToken } = await loginUser()

        const targetAvatar = await fetch('https://avatars.githubusercontent.com/u/583231?v=4')
        const targetAvatarBuffer = await targetAvatar.buffer()

        await request(app.callback())
            .post("/profile/avatar/@me")
            .set("Authorization", `Bearer ${targetToken}`)
            .set("Content-Type", "multipart/form-data")
            .attach("avatar", targetAvatarBuffer, { filename: "my_cool_avatar.png" })

        const response = await request(app.callback())
            .get(`/profile/${targetId}`)
            .set("Authorization", `Bearer ${viewerToken}`)

        const hash = response.body.avatarHash

        const avatar = await request(app.callback())
            .get(`/profile/avatar/${hash}`)
            .set("Authorization", `Bearer ${viewerToken}`)

        expect(avatar.statusCode).toBe(200)
        expect(avatar.type).toBe("image/png")
    })
})