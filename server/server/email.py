import os
import requests


TEMPLATE_IDS = {
    "VERIFY_AFTER_CHANGE": "d-da12e9e5850445f4a4ec47b97eb1d88d",
    "VERIFY_AFTER_LOGIN": "d-a128349178f84e15b3612b1198d5488a",
    "VERIFY_AFTER_SIGNUP": "d-58a37a60f5e54322afb9f918d3c13b03"
}


def send_email(address, template, params={}):
    requests.post(
        "https://api.sendgrid.com/v3/mail/send",
        headers = {
            "Authorization": f"Bearer {os.environ['SENDGRID_API_KEY']}"
        },
        json={
            "from": {
                "email": "flowspace@breq.dev"
            },
            "personalizations": [
                {
                    "to": [
                        {
                            "email": address
                        }
                    ],
                    "dynamic_template_data": params
                }
            ],
            "template_id": template
        }
    ).raise_for_status()