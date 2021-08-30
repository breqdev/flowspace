const snowcloud = require("../utils/snowcloud")
const prisma = require("./prisma")

const getDirectMessageChannel = async (fromId, toId) => {
    let channel = await prisma.channel.findFirst({
        where: {
            type: "DIRECT",
            directRecipients: {
                every: { id: { in: [fromId, toId] } }
            }
        }
    })

    if (!channel) {
        channel = await prisma.channel.create({
            data: {
                id: await snowcloud.generate(),
                type: "DIRECT",
                directRecipients: {
                    connect: [ { id: fromId }, { id: toId } ]
                }
            }
        })
    }

    return channel
}

module.exports = getDirectMessageChannel
