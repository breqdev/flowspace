const request = require("supertest")

const app = require("../index.js")


const createPost = async (title, content, isPrivate, token) => {
    return await request(app.callback())
        .post("/posts")
        .send({
            title,
            content,
            isPrivate
        })
        .set("Authorization", `Bearer ${token}`)
}


const getPost = async (id, token) => {
    return await request(app.callback())
        .get(`/posts/${id}`)
        .set("Authorization", `Bearer ${token}`)
}


const editPost = async (id, title, content, isPrivate, token) => {
    return await request(app.callback())
        .patch(`/posts/${id}`)
        .send({
            title,
            content,
            isPrivate
        })
        .set("Authorization", `Bearer ${token}`)
}


const deletePost = async (id, token) => {
    return await request(app.callback())
        .delete(`/posts/${id}`)
        .set("Authorization", `Bearer ${token}`)
}


module.exports = {
    createPost,
    getPost,
    editPost,
    deletePost
}
