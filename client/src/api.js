import React from "react"
import useSWR from "swr"

import AuthContext from "./AuthContext.js"

export const BASE_URL = "http://localhost:5000"


// Token must be an argument to the fetcher.
// We can't take it from the context.
// https://swr.vercel.app/docs/arguments#multiple-arguments


async function refreshToken(token, now) {
    const refreshTokenData = JSON.parse(atob(token.refresh_token.split(".")[1]))

    if (now >= refreshTokenData.exp) {
        console.log("Refresh token is not valid")
        return null
    }

    const refreshResponse = await fetch(
        BASE_URL + "/auth/refresh",
        {
            headers: {
                Authorization: `Bearer ${token.refresh_token}`
            },
            method: "POST"
        }
    )

    const refreshData = await refreshResponse.json()

    if (!refreshResponse.ok) {
        return null
    } else {
        return {
            access_token: refreshData.access_token,
            refresh_token: token.refresh_token
        }
    }
}


async function refreshIfNeeded(token, setToken) {
    const tokenData = JSON.parse(atob(token.access_token.split(".")[1]))
    const now = Math.floor((new Date()).getTime() / 1000)

    if (now >= tokenData.exp) {
        const newToken = await refreshToken(token, now)
        setToken(newToken)
        return newToken
    }

    return token
}


export async function fetchWithToken(url, token, setToken, options) {
    const newToken = await refreshIfNeeded(token, setToken)

    const response = await fetch(BASE_URL + url, {
        headers: {
            Authorization: `Bearer ${newToken.access_token}`,
            "Content-Type": (
                options?.contentType
                || (["PUT", "POST", "PATCH"].includes(options?.method)
                    ? "application/json"
                    : undefined
                )
            )
        },
        ...options
    })

    const data = await response.json()
    return data
}


export function useAPI(url) {
    const [token, setToken] = React.useContext(AuthContext)

    const result = useSWR([url, token, setToken], fetchWithToken)

    if (result.error) {
        console.log(result.error)
    }

    return result
}