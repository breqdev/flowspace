const Koa = require("koa")

const indexRoutes = require("./routes/index")

const app = new Koa()

app.use(indexRoutes.routes())

app.listen(5000)