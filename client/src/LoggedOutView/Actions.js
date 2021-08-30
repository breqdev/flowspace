import React from "react"
import { useLocation } from "react-router-dom"

import AuthContext from "../context/AuthContext.js"
import { BASE_URL } from "../utils/api.js"

export function DoVerify(props) {
    const [, setToken] = React.useContext(AuthContext)

    const { search } = useLocation()

    React.useEffect(() => {
        const params = new URLSearchParams(search)

        async function doVerify() {
            const refresh_token = params.get("token")

            const refresh_response = await fetch(BASE_URL + "/auth/verify", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${refresh_token}`
                }
            })

            const new_token = await refresh_response.json()

            setToken({refresh_token, ...new_token})
        }

        doVerify()
    }, [setToken, search])

    return (
        <>
            <h2 className="text-2xl mb-4">just a sec</h2>
            <hr />
            <p className="text-lg my-2">
                validating your email address now...
            </p>
        </>
    )
}
