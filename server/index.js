require('dotenv').config()

const Koa = require("koa")
const bodyparser = require("koa-bodyparser")

const authMiddleware = require("./middleware/auth")
const { errorHandler, errorCatcher } = require("./middleware/error")
const requireLogin = require("./middleware/requireLogin")

const indexRoutes = require("./routes/index")
const authRoutes = require("./routes/auth")
const profileRoutes = require("./routes/profile")

const app = new Koa()

// App Configuration
app.use(errorCatcher)
app.on("error", errorHandler)

app.use(bodyparser({
    enableTypes: ["json", "form", "text"]
}))

// Preliminary Authentication Middleware
app.use(authMiddleware)

// Unprotected Routes
app.use(indexRoutes.routes())
app.use(indexRoutes.allowedMethods())

// (auth routes must be unprotected, how else would users get a token?)
app.use(authRoutes.routes())
app.use(authRoutes.allowedMethods())

// Authentication Required Middleware -- login required beyond this point
app.use(requireLogin)

// Protected Routes
app.use(profileRoutes.routes())
app.use(profileRoutes.allowedMethods())


if (require.main === module) {
    app.listen(3000)
}

module.exports = app