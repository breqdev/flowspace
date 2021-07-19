require("dotenv").config()

const Koa = require("koa")
const bodyparser = require("koa-bodyparser")

const authMiddleware = require("./middleware/auth")
const { errorHandler, errorCatcher } = require("./middleware/error")
const requireLogin = require("./middleware/requireLogin")
const cors = require("./middleware/cors")
const serializeBigInt = require("./middleware/serializeBigInt")

const indexRoutes = require("./routes/index")
const authRoutes = require("./routes/auth")
const profileRoutes = require("./routes/profile")

const app = new Koa()

// App Configuration
app.use(cors)

app.use(errorCatcher)
app.on("error", errorHandler)

app.use(bodyparser({
    enableTypes: ["json", "form", "text"]
}))

app.use(serializeBigInt)

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
    app.listen(process.env.PORT || 5000, process.env.HOST || "0.0.0.0")
}

module.exports = app