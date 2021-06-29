import React from "react"
import useSWR from "swr"

import AuthContext from "./AuthContext.js"

const BASE_URL = "http://localhost:5000"

export default function useAPI(url) {
    const [token, setToken] = React.useContext(AuthContext)

    const fetcher = async (url) => {
        const token_data = JSON.parse(atob(token.access_token.split(".")[1]))

        const now = Math.floor((new Date()).getTime() / 1000)

        if (now > token_data.exp) {
            const new_token = await fetch(BASE_URL + "/auth/refresh", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token.refresh_token}`
                }
            })

            setToken({...token, access_token: new_token.access_token})
        }

        const response = await fetch(BASE_URL + url, {
            headers: {
                Authorization: `Bearer ${token.access_token}`
            }
        })

        const data = await response.json()

        return data
    }

    const result = useSWR(url, fetcher)

    if (result.error) {
        console.log(result.error)
    }

    return result
}