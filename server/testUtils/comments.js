const request = require("supertest")

const app = require("../index.js")


const createComment = async (postId, content, token, parent) => {
    return await request(app.callback())
        .post(`/comments/post/${postId}`)
        .send({
            content,
            parent,
        })
        .set("Authorization", `Bearer ${token}`)
}


const getComment = async (id, token) => {
    return await request(app.callback())
        .get(`/comments/${id}`)
        .set("Authorization", `Bearer ${token}`)
}


const editComment = async (id, content, token) => {
    return await request(app.callback())
        .patch(`/comments/${id}`)
        .send({
            content,
        })
        .set("Authorization", `Bearer ${token}`)
}


const deleteComment = async (id, token) => {
    return await request(app.callback())
        .delete(`/comments/${id}`)
        .set("Authorization", `Bearer ${token}`)
}


const getPostComments = async (id, token) => {
    return await request(app.callback())
        .get(`/comments/post/${id}`)
        .set("Authorization", `Bearer ${token}`)
}


module.exports = {
    createComment,
    getComment,
    editComment,
    deleteComment,
    getPostComments
}
