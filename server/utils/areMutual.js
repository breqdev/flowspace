const prisma = require("../utils/prisma")


const areMutual = async (fromId, toId) => {
    if (fromId === toId) {
        return true
    }

    const outgoingRelationship = await prisma.userRelationship.findUnique({
        where: {
            fromId_toId: {
                fromId,
                toId
            }
        }
    })

    const incomingRelationship = await prisma.userRelationship.findUnique({
        where: {
            fromId_toId: {
                fromId: toId,
                toId: fromId
            }
        }
    })

    if (!outgoingRelationship || !incomingRelationship) {
        return false
    }

    if (outgoingRelationship.type === "BLOCK" || incomingRelationship.type === "BLOCK") {
        return false
    }

    return true
}


module.exports = areMutual