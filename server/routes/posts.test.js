const { loginUser } = require("../testUtils/auth")
const { createPost, getPost, editPost, deletePost, getUserPosts } = require("../testUtils/posts")
const { createMutualRelationship } = require("../testUtils/relationship")
const prisma = require("../utils/prisma")

describe("create post", () => {
    it("allows authenticated users to create public posts", async () => {
        const { token } = await loginUser()

        const response = await createPost("My Title", "My Post Content", false, token)

        expect(response.status).toBe(200)
        expect(response.body.title).toBe("My Title")
    })

    it("does not allow unauthenticated users to create posts", async () => {
        const response = await createPost("My Title", "My Post Content", false, "")

        expect(response.status).toBe(401)
    })

    it("allows creating private posts", async () => {
        const { token } = await loginUser()

        const response = await createPost("My Private Title", "My Private Post Content", true, token)

        expect(response.status).toBe(200)
        expect(response.body.title).toBe("My Private Title")
    })

    it("allows creating a post with no content", async () => {
        const { token } = await loginUser()

        const response = await createPost("My Title", null, false, token)

        expect(response.status).toBe(200)
        expect(response.body.title).toBe("My Title")
        expect(response.body.content).toBe(null)
    })

    it("does not allow excessively long titles", async () => {
        const { token } = await loginUser()

        const response = await createPost("A".repeat(256), "My Post Content", false, token)

        expect(response.status).toBe(400)
    })
})


describe("read post", () => {
    it("allows anyone to read a public post", async () => {
        const { token: poster } = await loginUser({ email: "poster@example.com" })
        const { token: reader } = await loginUser({ email: "reader@example.com" })

        const { body } = await createPost("My Title", "My Post Content", false, poster)

        const response = await getPost(body.id, reader)

        expect(response.status).toBe(200)
        expect(response.body.title).toBe("My Title")
    })

    it("restricts access to private posts", async () => {
        const { token: poster } = await loginUser({ email: "poster@example.com" })
        const { token: reader } = await loginUser({ email: "reader@example.com" })

        const { body } = await createPost("My Private Title", "My Private Post Content", true, poster)

        const response = await getPost(body.id, reader)

        expect(response.status).toBe(404)
        expect(response.body.title).toBeUndefined()
    })

    it("allows mutuals to access a private post", async () => {
        const { fromToken, toToken } = await createMutualRelationship()

        const { body } = await createPost("My Private Title", "My Private Post Content", true, fromToken)

        const response = await getPost(body.id, toToken)

        expect(response.status).toBe(200)
        expect(response.body.title).toBe("My Private Title")
    })
})

describe("edit post", () => {
    afterEach(() => {
        jest.useRealTimers()
    })

    it("allows the author to edit a post", async () => {
        const { token } = await loginUser()

        const { body } = await createPost("My Title", "My Post Content", false, token)

        const response = await editPost(body.id, "My New Title", "My New Post Content", false, token)

        expect(response.status).toBe(200)
        expect(response.body.title).toBe("My New Title")
    })

    it("only allows the author to edit a post", async () => {
        const { token: poster } = await loginUser({ email: "poster@example.com" })
        const { token: reader } = await loginUser({ email: "reader@example.com" })

        const { body } = await createPost("My Title", "My Post Content", false, poster)

        const response = await editPost(body.id, "My New Title", "My New Post Content", false, reader)

        expect(response.status).toBe(404)

        const { body: original } = await getPost(body.id, poster)
        expect(original.title).toBe("My Title")
    })

    it("restricts the length of titles when editing", async () => {
        const { token } = await loginUser()

        const { body } = await createPost("My Title", "My Post Content", false, token)

        const response = await editPost(body.id, "A".repeat(256), "My New Post Content", false, token)

        expect(response.status).toBe(400)
    })

    it("properly sets the editedAt timestamp", async () => {
        jest.useFakeTimers()

        const { token } = await loginUser()

        jest.setSystemTime(new Date("2020-01-01 00:00:00"))

        const { body } = await createPost("My Title", "My Post Content", false, token)

        jest.setSystemTime(new Date("2020-01-02 00:00:00"))

        const response = await editPost(body.id, "My New Title", "My New Post Content", false, token)

        expect(response.status).toBe(200)
        expect(response.body.createdAt).toBe("2020-01-01T00:00:00.000Z")
        expect(response.body.editedAt).toBe("2020-01-02T00:00:00.000Z")
    })

    it("actually edits the post", async () => {
        const { token } = await loginUser()

        const { body } = await createPost("My Title", "My Post Content", false, token)

        await editPost(body.id, "My New Title", "My New Post Content", false, token)

        const response = await getPost(body.id, token)

        expect(response.status).toBe(200)
        expect(response.body.title).toBe("My New Title")
        expect(response.body.content).toBe("My New Post Content")
    })
})


describe("delete post", () => {
    it("allows the author to delete a post", async () => {
        const { token } = await loginUser()

        const { body } = await createPost("My Title", "My Post Content", false, token)

        const response = await deletePost(body.id, token)

        expect(response.status).toBe(200)
        expect(response.body.title).toBeUndefined()
    })

    it("actually deletes the post", async () => {
        const { token } = await loginUser()

        const { body } = await createPost("My Title", "My Post Content", false, token)

        await deletePost(body.id, token)

        const response = await getPost(body.id, token)

        expect(response.status).toBe(404)
    })

    it("does not allow other users to delete a post", async () => {
        const { token: poster } = await loginUser({ email: "poster@example.com" })
        const { token: reader } = await loginUser({ email: "reader@example.com" })

        const { body } = await createPost("My Title", "My Post Content", false, poster)

        const response = await deletePost(body.id, reader)

        expect(response.status).toBe(404)

        const { body: original } = await getPost(body.id, poster)
        expect(original.title).toBe("My Title")
    })
})


describe("get user posts", () => {
    afterEach(() => {
        jest.useRealTimers()
    })

    it("retrieves a post that a user has made", async () => {
        const { id, token } = await loginUser()

        await createPost("My Title", "My Post Content", false, token)

        const response = await getUserPosts(id, token)

        expect(response.status).toBe(200)
        expect(response.body.length).toBe(1)
        expect(response.body[0].title).toBe("My Title")
    })

    it("returns posts newest-to-oldest", async () => {
        jest.useFakeTimers()

        const { id, token } = await loginUser()

        jest.setSystemTime(new Date("2020-01-01 00:00:00"))
        await createPost("My Title", "My Post Content", false, token)

        jest.setSystemTime(new Date("2020-01-02 00:00:00"))
        await createPost("My Second Title", "My Second Post Content", false, token)

        const response = await getUserPosts(id, token)

        expect(response.status).toBe(200)
        expect(response.body.length).toBe(2)
        expect(response.body[0].title).toBe("My Second Title")
        expect(response.body[1].title).toBe("My Title")
    })

    it("restricts access to private posts", async () => {
        const { token: poster, id } = await loginUser({ email: "poster@example.com" })
        const { token: reader } = await loginUser({ email: "reader@example.com" })

        await createPost("My Title", "My Post Content", false, poster)
        await createPost("My Private Post", "My Private Content", true, poster)

        const response = await getUserPosts(id, reader)

        expect(response.status).toBe(200)
        expect(response.body.length).toBe(1)
        expect(response.body[0].title).toBe("My Title")
    })

    it("allows mutuals to access private posts", async () => {
        const { fromToken, fromId, toToken } = await createMutualRelationship()

        await createPost("My Title", "My Post Content", false, fromToken)
        await createPost("My Private Post", "My Private Content", true, fromToken)

        const response = await getUserPosts(fromId, toToken)

        expect(response.status).toBe(200)
        expect(response.body.length).toBe(2)
        expect(response.body.map(x => x.title)).toContain("My Private Post")
    })

    it("returns an empty array if the user has no posts", async () => {
        const { id, token } = await loginUser()

        const response = await getUserPosts(id, token)

        expect(response.status).toBe(200)
        expect(response.body.length).toBe(0)
    })
})
