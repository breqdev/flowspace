const { loginUser } = require("../testUtils/auth")
const { createRelationship } = require("../testUtils/relationship")
const { getFeed } = require("../testUtils/feed")
const { createPost } = require("../testUtils/posts")

describe("home feed", () => {
    afterEach(() => {
        jest.useRealTimers()
    })

    it("is empty for a new user", async () => {
        const { token } = await loginUser()
        const response = await getFeed(token)
        expect(response.body.length).toBe(0)
    })

    it("shows posts from a user that was followed", async () => {
        const { token: follower } = await loginUser({ email: "follower@example.com" })
        const { token: poster, id: posterId } = await loginUser({ email: "poster@example.com" })

        await createRelationship(posterId, follower, "FOLLOW")

        await createPost("Hello World!", "This is my post. Is it in your feed?", false, poster)

        const response = await getFeed(follower)
        expect(response.body.length).toBe(1)
        expect(response.body[0].content).toBe("This is my post. Is it in your feed?")
    })

    it("sorts posts newest-first", async () => {
        jest.useFakeTimers()

        const { token: follower } = await loginUser({ email: "follower@example.com" })
        const { token: poster, id: posterId } = await loginUser({ email: "poster@example.com" })

        await createRelationship(posterId, follower, "FOLLOW")

        jest.setSystemTime(new Date("2020-01-01 00:00:00"))
        await createPost("Hello World!", "This is my post. Is it in your feed?", false, poster)

        jest.setSystemTime(new Date("2020-01-01 00:00:01"))
        await createPost("Hello World 2!", "This is another post.", false, poster)

        const response = await getFeed(follower)

        expect(response.body.length).toBe(2)
        expect(response.body[0].content).toBe("This is another post.")
        expect(response.body[1].content).toBe("This is my post. Is it in your feed?")
    })

    it("shows posts from multiple users", async () => {
        jest.useFakeTimers()

        const { token: follower } = await loginUser({ email: "follower@example.com" })
        const { token: poster1, id: poster1Id } = await loginUser({ email: "poster1@example.com" })
        const { token: poster2, id: poster2Id } = await loginUser({ email: "poster2@example.com" })


        await createRelationship(poster1Id, follower, "FOLLOW")
        await createRelationship(poster2Id, follower, "FOLLOW")

        jest.setSystemTime(new Date("2020-01-01 00:00:00"))
        await createPost("Hello World!", "This is my post. Is it in your feed?", false, poster1)

        jest.setSystemTime(new Date("2020-01-01 00:00:01"))
        await createPost("Hello World 2!", "This is another post.", false, poster2)

        const response = await getFeed(follower)

        expect(response.body.length).toBe(2)
        expect(response.body[0].content).toBe("This is another post.")
        expect(response.body[1].content).toBe("This is my post. Is it in your feed?")
    })
})
