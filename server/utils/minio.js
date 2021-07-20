const Minio = require("minio")

const minio = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: process.env.MINIO_PORT || 9000,
    useSSL: (process.env.MINIO_USE_SSL === "true"),
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
})

module.exports = minio
