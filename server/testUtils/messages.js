const request = require("supertest")

const app = require("../index.js")


const getMessages = async (fromId, token) => {
    return await request(app.callback())
        .get(`/messages/direct/${fromId}`)
        .set("Authorization", `Bearer ${token}`)
}

const sendMessage = async (toId, token, content) => {
    return await request(app.callback())
        .post(`/messages/direct/${toId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ content })
}

module.exports = {
    getMessages,
    sendMessage
}
