const fetch = require("node-fetch")

const EMAIL_TEMPLATES = {
    EMAIL_CHANGE: "d-da12e9e5850445f4a4ec47b97eb1d88d",
    VERIFY_LOGIN: "d-a128349178f84e15b3612b1198d5488a",
    SIGNUP: "d-58a37a60f5e54322afb9f918d3c13b03",
    RESET_PASSWORD: "d-3bdffe819fa44ff7b69a5ad6f1088d04"
}


const sendEmail = async (address, template, params) => {
    const result = await fetch(
        "https://api.sendgrid.com/v3/mail/send",
        {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + process.env.SENDGRID_API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: {
                    email: "flowspace@breq.dev",
                },
                personalizations: [{
                    to: [ { email: address } ],
                    dynamic_template_data: params
                }],
                template_id: template
            })
        }
    )

    return result.status === 200
}

module.exports = {
    sendEmail,
    EMAIL_TEMPLATES
}