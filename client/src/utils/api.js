import React from "react"
import useSWR from "swr"

import AuthContext from "../context/AuthContext.js"

export const BASE_URL = (
    process.env.NODE_ENV === "development"
    ? "http://localhost:5000"
    : "https://flowspace-api.breq.dev"
)

export const GATEWAY_URL = BASE_URL.replace("http", "ws") + "/gateway"


// Token must be an argument to the fetcher.
// We can't take it from the context.
// https://swr.vercel.app/docs/arguments#multiple-arguments


async function refreshToken(token, now) {
    const refreshTokenData = JSON.parse(atob(token.refresh_token.split(".")[1]))

    if (now >= refreshTokenData.exp) {
        // refresh token expired, log the user out completely
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

    // Make sure options.headers exists
    options = options || {}
    options.headers = options.headers || {}

    // Detect the Content-Type of the request
    if (options?.headers["Content-Type"]) {
        // Already set for us :)

    } else if (["POST", "PUT", "PATCH"].includes(options?.method) && options?.body) {

        if (options.body instanceof FormData) {
            // multipart/form-data
            // We need to explicitly remove the Content-Type header
            // This allows the browser to set the boundary
            // https://muffinman.io/blog/uploading-files-using-fetch-multipart-form-data/#problem-i-had

            delete options.headers["Content-Type"]

        } else if (options.body instanceof URLSearchParams) {
            // application/x-www-form-urlencoded
            // (keys and values encoded as a query string)

            // Turn the query object into a string for convenience
            options.body = options.body.toString()

            options.headers["Content-Type"] = "application/x-www-form-urlencoded"

        } else if (typeof options.body === "object") {
            // This is an object / not a primitive
            // Attempt to serialize it to JSON

            options.body = JSON.stringify(options.body)

            options.headers["Content-Type"] = "application/json"

        } else {
            // Probably just plain text?
            options.headers["Content-Type"] = "text/plain"
        }
    }

    // Add the bearer token to the headers
    options.headers.Authorization = `Bearer ${newToken.access_token}`


    const response = await fetch(BASE_URL + url, options)

    const data = await response.json()

    // ugly hack to expose some response fields on the data object
    data.ok = response.ok
    data.status_code = response.status

    return data
}


export function useAPI(url, args, options) {
    const [token, setToken] = React.useContext(AuthContext)

    args = args || []

    args.forEach((value, idx) => {
        url = url.replace(":" + idx, value)
    })

    let fetchKey
    if (args.includes(null) || args.includes(undefined)) {
        fetchKey = null
    } else {
        fetchKey = [url, token, setToken]
    }

    const result = useSWR(fetchKey, fetchWithToken, {
        refreshInterval: 60 * 1000,
        ...options
    })

    if (result.error) {
        console.log(result.error)
        // throw (result.error)
    }

    return result
}


export const avatarUrl = (hash, size) => `${BASE_URL}/profile/avatar/${hash || "@default"}/${size}`
