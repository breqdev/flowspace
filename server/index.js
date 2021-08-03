require("dotenv").config()

const Koa = require("koa")
const bodyparser = require("koa-bodyparser")

const rateLimit = require("./middleware/rateLimit")
const authMiddleware = require("./middleware/auth")
const { errorHandler, errorCatcher } = require("./middleware/error")
const requireLogin = require("./middleware/requireLogin")
const cors = require("./middleware/cors")

const indexRoutes = require("./routes/index")
const avatarRoutes = require("./routes/avatar")
const authRoutes = require("./routes/auth")
const profileRoutes = require("./routes/profile")
const relationshipRoutes = require("./routes/relationship")

const app = new Koa()


// BigInt JSON Serialization hack using prototype manipulation
BigInt.prototype.toJSON = function() { return this.toString() }


// App Configuration
app.use(cors)

app.use(errorCatcher)
app.on("error", errorHandler)

app.use(bodyparser({
    enableTypes: ["json", "form", "text"]
}))

// Preliminary Authentication Middleware
app.use(authMiddleware)

app.use(rateLimit)

// Unprotected Routes
app.use(indexRoutes.routes())
app.use(indexRoutes.allowedMethods())

// Avatars are public
app.use(avatarRoutes.routes())
app.use(avatarRoutes.allowedMethods())

// (auth routes must be unprotected, how else would users get a token?)
app.use(authRoutes.routes())
app.use(authRoutes.allowedMethods())

// Authentication Required Middleware -- login required beyond this point
app.use(requireLogin)

// Protected Routes
app.use(profileRoutes.routes())
app.use(profileRoutes.allowedMethods())

app.use(relationshipRoutes.routes())
app.use(relationshipRoutes.allowedMethods())


if (require.main === module) {
    app.listen(process.env.PORT || 5000, process.env.HOST || "0.0.0.0")
}

module.exports = app