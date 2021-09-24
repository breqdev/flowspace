const request = require("supertest")

const app = require("../index.js")

const getFeed = async (token) => {
    return await request(app.callback())
        .get("/feed")
        .set("Authorization", `Bearer ${token}`)
}

module.exports = {
    getFeed
}