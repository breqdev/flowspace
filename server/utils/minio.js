const Minio = require("minio")

const minio = new Minio.Client({
    endPoint: "localhost",
    port: 9000,
    useSSL: false,
    accessKey: "GHMAQ7TD47U12V70AU2S",
    secretKey: "8q+vAoo9UQoVi0tj3AX5r1flcAPp3vn8EIcgttiL"
})

module.exports = minio
