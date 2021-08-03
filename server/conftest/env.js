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

        const envVars = {
            DATABASE_URL: this.dbURL,
            PRISMA_BINARY: prismaBinary,
            SENDGRID_SANDBOX: "enabled",
            SNOWCLOUD_SANDBOX: "enabled",
            DISABLE_RATE_LIMITING: "true"
        }

        for (const key in envVars) {
            process.env[key] = envVars[key]
            this.global.process.env[key] = envVars[key]
        }

        await exec(`${prismaBinary} migrate reset --force`)

        await prisma.$connect()
    }

    async teardown() {
        await prisma.$disconnect()

        const rawClient = new Client({
            connectionString: this.dbURL
        })

        await rawClient.connect()
        await rawClient.query(`DROP SCHEMA IF EXISTS "${this.schema}" CASCADE`)
        await rawClient.end()

        await super.teardown()
    }
}

module.exports = PrismaTestEnvironment
