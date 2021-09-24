const { loginUser } = require("../testUtils/auth")
const { createPost, getPost, editPost, deletePost, getUserPosts } = require("../testUtils/posts")
const { createComment, getComment, editComment, deleteComment, getPostComments } = require("../testUtils/comments")
const { createMutualRelationship, createRelationship } = require("../testUtils/relationship")
const prisma = require("../utils/prisma")

describe("get post comments", () => {
    afterEach(() => {
        jest.useRealTimers()
    })

    it("returns an empty list if a post has no comments", async () => {
        const { token } = await loginUser()

        const { body } = await createPost("My Title", "My Post Content", false, token)

        const response = await getPostComments(body.id, token)

        expect(response.status).toBe(200)
        expect(response.body.length).toBe(0)
    })

    it("returns a list of comments if a post has comments", async () => {
        const { token } = await loginUser()

        const { body } = await createPost("My Title", "My Post Content", false, token)

        await createComment(body.id, "My Comment", token)

        const response = await getPostComments(body.id, token)

        expect(response.status).toBe(200)
        expect(response.body.length).toBe(1)
        expect(response.body[0].content).toBe("My Comment")
    })

    it("returns comments newest first", async () => {
        jest.useFakeTimers()

        const { token } = await loginUser()

        const { body } = await createPost("My Title", "My Post Content", false, token)

        jest.setSystemTime(new Date("2020-01-01 00:00:00"))
        await createComment(body.id, "My Comment", token)

        jest.setSystemTime(new Date("2020-01-01 00:00:01"))
        await createComment(body.id, "My Comment 2", token)

        const response = await getPostComments(body.id, token)

        expect(response.status).toBe(200)
        expect(response.body.length).toBe(2)
        expect(response.body[0].content).toBe("My Comment 2")
        expect(response.body[1].content).toBe("My Comment")
    })

    it("restricts access to comments on private posts", async () => {
        const { token: poster } = await loginUser({ email: "poster@example.com" })
        const { token: reader } = await loginUser({ email: "reader@example.com" })

        const { body } = await createPost("My Title", "My Post Content", true, poster)

        await createComment(body.id, "My Comment", poster)

        const response = await getPostComments(body.id, reader)

        expect(response.status).toBe(404)
    })

    it("allows mutuals to view comments on private posts", async () => {
        const { fromToken, fromId, toToken } = await createMutualRelationship()

        const { body } = await createPost("My Private Post", "My Private Content", true, fromToken)
        await createComment(body.id, "My Comment", fromToken)

        const response = await getPostComments(body.id, toToken)

        expect(response.status).toBe(200)
        expect(response.body.length).toBe(1)
        expect(response.body[0].content).toBe("My Comment")
    })
})

describe("create comments", () => {
    it("allows users to comment on their own posts", async () => {
        const { token } = await loginUser()

        const { body } = await createPost("My Title", "My Post Content", false, token)

        const response = await createComment(body.id, "My Comment", token)

        expect(response.status).toBe(200)
        expect(response.body.content).toBe("My Comment")
    })

    it("does not allow users with no relationship to comment", async () => {
        const { token: poster } = await loginUser({ email: "poster@example.com" })
        const { token: reader } = await loginUser({ email: "reader@example.com" })

        const { body } = await createPost("My Title", "My Post Content", false, poster)

        const response = await createComment(body.id, "My Comment", reader)

        expect(response.status).toBe(404)
    })

    it("allows mutuals to comment", async () => {
        const { fromToken, toToken } = await createMutualRelationship()

        const { body } = await createPost("My Private Post", "My Private Content", false, fromToken)

        const response = await createComment(body.id, "My Comment", toToken)

        expect(response.status).toBe(200)
        expect(response.body.content).toBe("My Comment")
    })

    it("does not allow users that aren't followed back to comment", async () => {
        const { fromToken, toToken, toId } = await createMutualRelationship()

        await createRelationship(toId, fromToken, "NONE")

        const { body } = await createPost("My Private Post", "My Private Content", false, fromToken)

        const response = await createComment(body.id, "My Comment", toToken)

        expect(response.status).toBe(404)
    })
})

describe("edit comments", () => {
    it("allows users to edit their own comments", async () => {
        const { token } = await loginUser()

        const { body } = await createPost("My Title", "My Post Content", false, token)

        const comment = await createComment(body.id, "My Comment", token)
        const response = await editComment(comment.body.id, "My Edited Comment", token)

        expect(response.status).toBe(200)
        expect(response.body.content).toBe("My Edited Comment")
    })

    it("does not allow users to edit each others' comments", async () => {
        const { fromToken, toToken } = await createMutualRelationship()

        const { body } = await createPost("My Title", "My Post Content", false, fromToken)

        const comment = await createComment(body.id, "My Comment", fromToken)
        const response = await editComment(comment.body.id, "My Edited Comment", toToken)

        expect(response.status).toBe(404)
    })
})


describe("delete comments", () => {
    it("allows users to delete their own comments", async () => {
        const { token } = await loginUser()

        const { body } = await createPost("My Title", "My Post Content", false, token)

        const comment = await createComment(body.id, "My Comment", token)
        const response = await deleteComment(comment.body.id, token)
        expect(response.status).toBe(200)

        const comments = await getPostComments(body.id, token)
        expect(comments.body.length).toBe(0)
    })

    it("does not allow users to delete each others' comments", async () => {
        const { fromToken, toToken } = await createMutualRelationship()

        const { body } = await createPost("My Title", "My Post Content", false, fromToken)

        const comment = await createComment(body.id, "My Comment", fromToken)
        const response = await deleteComment(comment.body.id, toToken)

        expect(response.status).toBe(404)
    })
})

describe("nested comments", () => {
    it("allows setting a parent comment for a comment", async () => {
        const { token } = await loginUser()

        const { body } = await createPost("My Title", "My Post Content", false, token)

        const comment = await createComment(body.id, "My Comment", token)

        const response = await createComment(body.id, "My Nested Comment", token, comment.body.id)

        expect(response.status).toBe(200)
        expect(response.body.parentId).toBe(comment.body.id)
    })
})
