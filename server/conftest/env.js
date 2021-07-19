const { Client } = require("pg")
const prisma = require("../utils/prisma")
const NodeEnvironment = require("jest-environment-node")
const { v4: uuidv4 } = require("uuid")


const util = require("util")
const exec = require("./exec")


const prismaBinary = "./node_modules/.bin/prisma2"


class PrismaTestEnvironment extends NodeEnvironment {
    constructor(config) {
        super(config)

        this.schema = `test_${uuidv4()}`

        this.dbURL = `postgresql://postgres:postgres@localhost:5432/flowspace?schema=${this.schema}`
    }

    async setup() {
        await super.setup()

        this.global.__PRISMA__ = prisma

        process.env.DATABASE_URL = this.dbURL
        this.global.process.env.DATABASE_URL = this.dbURL

        process.env.PRISMA_BINARY = prismaBinary
        this.global.process.env.PRISMA_BINARY = prismaBinary

        process.env.SENDGRID_SANDBOX = "enabled"
        this.global.process.env.SENDGRID_SANDBOX = "enabled"

        await exec(`${prismaBinary} migrate reset --force`)

        await prisma.$connect()
    }

    async teardown() {
        await super.teardown()

        await prisma.$disconnect()

        const rawClient = new Client({
            connectionString: this.dbURL
        })

        await rawClient.connect()
        await rawClient.query(`DROP SCHEMA IF EXISTS "${this.schema}" CASCADE`)
        await rawClient.end()
    }
}

module.exports = PrismaTestEnvironment
