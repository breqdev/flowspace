const Koa = require("koa")
const bodyparser = require("koa-bodyparser")

const authMiddleware = require("./middleware/auth")

const indexRoutes = require("./routes/index")

const app = new Koa()

app.use(bodyparser({
    enableTypes: ["json", "form", "text"]
}))

app.use(authMiddleware)

app.use(indexRoutes.routes())
app.use(indexRoutes.allowedMethods())

app.listen(5000)
