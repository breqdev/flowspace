const redis = require("./redis")

const sendGatewayMessage = async (channel, type, data) => {
    redis.publish(channel, JSON.stringify({ type, data }))
}

module.exports = sendGatewayMessage
