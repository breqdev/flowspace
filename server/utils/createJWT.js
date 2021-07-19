const crypto = require("crypto")

const jwt = require("jsonwebtoken")

const ACCESS_TOKEN_EXPIRES = 60 * 60 // 1 hour
const REFRESH_TOKEN_EXPIRES = 60 * 60 * 24 * 7 // 1 week


const getSignature = (user) => {
    const secret = process.env.JWT_SECRET

    return crypto.createHmac("sha256", secret).update(user.password).digest("hex")
}


const createAccessToken = (user) => jwt.sign(
    {
        type: "access"
    },
    getSignature(user), // password hash
    {
        algorithm: "HS256",
        expiresIn: ACCESS_TOKEN_EXPIRES,
        subject: user.id.toString(),
    }
)


const createRefreshToken = (user, type) => jwt.sign(
    {
        type: type || "refresh"
    },
    getSignature(user), // password hash
    {
        algorithm: "HS256",
        expiresIn: REFRESH_TOKEN_EXPIRES,
        subject: user.id.toString(),
    }
)


module.exports = {
    getSignature,
    createAccessToken,
    createRefreshToken,
    ACCESS_TOKEN_EXPIRES,
    REFRESH_TOKEN_EXPIRES,
}