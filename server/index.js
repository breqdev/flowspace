const Koa = require("koa")
const bodyparser = require("koa-bodyparser")

const authMiddleware = require("./middleware/auth")

const indexRoutes = require("./routes/index")
const authRoutes = require("./routes/auth")

const app = new Koa()

app.use(bodyparser({
    enableTypes: ["json", "form", "text"]
}))

app.use(authMiddleware)

app.use(indexRoutes.routes())
app.use(indexRoutes.allowedMethods())

app.use(authRoutes.routes())
app.use(authRoutes.allowedMethods())

if (require.main === module) {
    app.listen(3000)
}

module.exports = app