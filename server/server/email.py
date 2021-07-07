import os
import requests


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