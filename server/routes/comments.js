const Router = require("@koa/router")

const snowcloud = require("../utils/snowcloud")
const prisma = require("../utils/prisma")
const parseBigInt = require("../utils/parseBigInt")
const areMutual = require("../utils/areMutual")

const router = new Router()


const LENGTH_LIMITS = {
    content: 1000,
}



router.get("/comments/:id", async ctx => {
    const comment = await prisma.comment.findUnique({
        where: {
            id: parseBigInt(ctx.params.id, ctx)
        },
        include: {
            post: true,
        }
    })

    if (!comment) {
        ctx.throw(404, "Comment not found")
        return
    }

    if (comment.post.isPrivate) {
        if (await areMutual(ctx.user.id, comment.post.authorId)) {
            ctx.body = comment
        } else {
            ctx.throw(404, "Comment not found")
            return
        }
    }

    ctx.body = comment
})


router.get("/comments/post/:id", async ctx => {
    const post = await prisma.post.findUnique({
        where: {
            id: parseBigInt(ctx.params.id, ctx)
        },
    })

    if (!post) {
        ctx.throw(404, "Post not found")
        return
    }

    const comments = await prisma.comment.findMany({
        where: {
            post: {
                id: parseBigInt(ctx.params.id, ctx)
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    })

    if (post.isPrivate) {
        if (await areMutual(ctx.user.id, post.authorId)) {
            ctx.body = comments
        } else {
            ctx.throw(404, "Post not found")
            return
        }
    }

    ctx.body = comments
})


router.post("/comments/post/:id", async ctx => {
    const data = ctx.request.body

    for (const field in LENGTH_LIMITS) {
        if (data[field] && data[field].length > LENGTH_LIMITS[field]) {
            ctx.throw(400, `${field} is too long`)
            return
        }
    }

    const post = await prisma.post.findUnique({
        where: {
            id: parseBigInt(ctx.params.id, ctx)
        },
    })

    if (!post) {
        ctx.throw(404, "Post not found")
        return
    }

    if (!(await areMutual(ctx.user.id, post.authorId))) {
        ctx.throw(404, "Post not found")
        return
    }

    const { content, parent } = data

    const parentComment = parent && await prisma.comment.findUnique({
        where: {
            id: parseBigInt(parent, ctx)
        }
    })

    if (parent && !parentComment) {
        ctx.throw(404, "Parent comment not found")
        return
    }

    const comment = await prisma.comment.create({
        data: {
            id: await snowcloud.generate(),
            createdAt: new Date(),
            editedAt: new Date(),
            content,
            author: {
                connect: { id: ctx.user.id },
            },
            post: {
                connect: { id: parseBigInt(ctx.params.id, ctx) },
            },
            parent: (parent ? { connect: { id: parentComment.id }} : undefined),
        }
    })

    ctx.body = comment
})

router.patch("/comments/:id", async ctx => {
    const original = await prisma.comment.findUnique({
        where: { id: parseBigInt(ctx.params.id, ctx) }
    })

    if (!original || original.authorId !== ctx.user.id) {
        ctx.throw(404, "Comment not found")
        return
    }

    const data = ctx.request.body

    for (const field in LENGTH_LIMITS) {
        if (data[field] && data[field].length > LENGTH_LIMITS[field]) {
            ctx.throw(400, `${field} is too long`)
            return
        }
    }

    const { content } = data

    const updated = await prisma.comment.update({
        where: { id: parseBigInt(ctx.params.id, ctx) },
        data: {
            content,
            editedAt: new Date(),
        }
    })

    ctx.body = updated
})


router.delete("/comments/:id", async ctx => {
    const original = await prisma.comment.findUnique({
        where: { id: parseBigInt(ctx.params.id, ctx) }
    })

    if (!original || original.authorId !== ctx.user.id) {
        ctx.throw(404, "Comment not found")
        return
    }

    await prisma.comment.delete({
        where: { id: parseBigInt(ctx.params.id, ctx) }
    })

    ctx.body = { deleted: true }
})


module.exports = router

