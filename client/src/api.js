import React from "react"
import useSWR from "swr"

import AuthContext from "./AuthContext.js"

export const BASE_URL = "http://localhost:5000"


export function useFetcher() {
    const [token, setToken] = React.useContext(AuthContext)

    return async (url, options) => {
        const token_data = JSON.parse(atob(token.access_token.split(".")[1]))

        const now = Math.floor((new Date()).getTime() / 1000)

        if (now > token_data.exp) {
            const refresh_response = await fetch(BASE_URL + "/auth/refresh", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token.refresh_token}`
                }
            })

            const new_token = await refresh_response.json()

            setToken({...token, access_token: new_token.access_token})
        }

        const response = await fetch(BASE_URL + url, {
            headers: {
                Authorization: `Bearer ${token.access_token}`,
                "Content-Type": (options?.contentType || (["PUT", "POST", "PATCH"].includes(options?.method) ? "application/json" : undefined))
            },
            ...options
        })

        const data = await response.json()

        return data
    }
}


export function useAPI(url) {
    const fetcher = useFetcher()

    const result = useSWR(url, fetcher)

    if (result.error) {
        console.log(result.error)
    }

    return result
}