const Router = require("@koa/router")

const snowcloud = require("../utils/snowcloud")
const prisma = require("../utils/prisma")
const parseBigInt = require("../utils/parseBigInt")
const areMutual = require("../utils/areMutual")

const router = new Router()


const LENGTH_LIMITS = {
    title: 100,
    content: 10000,
}


router.get("/posts/:id", async ctx => {
    const post = await prisma.post.findUnique({
        where: { id: parseBigInt(ctx.params.id, ctx) }
    })

    if (!post) {
        ctx.throw(404, "Post not found")
        return
    }

    if (post.isPrivate) {
        if (await areMutual(ctx.user.id, post.authorId)) {
            ctx.body = post
        } else {
            ctx.throw(404, "Post not found")
            return
        }
    }

    ctx.body = post
})


router.get("/posts/user/:id", async ctx => {
    const allowPrivate = await areMutual(ctx.user.id, parseBigInt(ctx.params.id, ctx))

    const posts = await prisma.post.findMany({
        where: {
            authorId: parseBigInt(ctx.params.id, ctx),
            isPrivate: (allowPrivate ? {} : { equals: false }),
        },
        orderBy: { createdAt: "desc" },
    })

    ctx.body = posts
})


router.post("/posts", async ctx => {
    const data = ctx.request.body

    for (const field in LENGTH_LIMITS) {
        if (data[field] && data[field].length > LENGTH_LIMITS[field]) {
            ctx.throw(400, `${field} is too long`)
            return
        }
    }

    const { title, content, isPrivate } = data

    const post = await prisma.post.create({
        data: {
            id: await snowcloud.generate(),
            createdAt: new Date(),
            editedAt: new Date(),
            title,
            content,
            isPrivate,
            author: {
                connect: { id: ctx.user.id },
            }
        }
    })

    ctx.body = post
})

router.patch("/posts/:id", async ctx => {
    const original = await prisma.post.findUnique({
        where: { id: parseBigInt(ctx.params.id, ctx) }
    })

    if (!original || original.authorId !== ctx.user.id) {
        ctx.throw(404, "Post not found")
        return
    }

    const data = ctx.request.body

    for (const field in LENGTH_LIMITS) {
        if (data[field] && data[field].length > LENGTH_LIMITS[field]) {
            ctx.throw(400, `${field} is too long`)
            return
        }
    }

    const { title, content, isPrivate } = data

    const updated = await prisma.post.update({
        where: { id: parseBigInt(ctx.params.id, ctx) },
        data: {
            title,
            content,
            isPrivate,
            editedAt: new Date(),
        }
    })

    ctx.body = updated
})


router.delete("/posts/:id", async ctx => {
    const original = await prisma.post.findUnique({
        where: { id: parseBigInt(ctx.params.id, ctx) }
    })

    if (!original || original.authorId !== ctx.user.id) {
        ctx.throw(404, "Post not found")
        return
    }

    await prisma.post.delete({
        where: { id: parseBigInt(ctx.params.id, ctx) }
    })

    ctx.body = { deleted: true }
})


module.exports = router

