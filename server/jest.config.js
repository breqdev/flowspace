const path = require("path")

module.exports = {
    testEnvironment: path.join(__dirname, "./conftest/env.js"),
    setupFiles: [path.join(__dirname, "./conftest/setup.js")]
}