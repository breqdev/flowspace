const crypto = require("crypto")


function generatePasswordHash(password) {
    const salt = crypto.randomBytes(16).toString("base64")
    const hash = crypto.createHmac("sha256", salt).update(password).digest("base64")

    return `sha256$${salt}$${hash}`
}

function checkPasswordHash(hash, password) {
    const parts = hash.trim().split("$")

    if (parts.length !== 3) {
        return false
    }

    const [algorithm, salt, bareHash] = parts

    if (algorithm !== "sha256") {
        return false
    }

    const newHash = crypto.createHmac("sha256", salt).update(password).digest("hex")

    return newHash === bareHash
}


module.exports = {
    generatePasswordHash,
    checkPasswordHash
}