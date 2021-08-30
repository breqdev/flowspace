import React, { useContext, useEffect, useRef, useState } from "react"
import AuthContext from "../context/AuthContext"

import GatewayContext from "../context/GatewayContext"
import { GATEWAY_URL } from "../utils/api"


function useGateway(callback) {
    const [token, ] = useContext(AuthContext)

    const [readyState, setReadyState] = useState("UNINITIALIZED")

    const ws = useRef(null)

    const reconnectTimeout = useRef(null)

    const connectWebsocket = React.useCallback(() => {
        ws.current = new WebSocket(GATEWAY_URL)

        ws.current.onopen = () => {
            setReadyState("CONNECTED")

            ws.current.send(JSON.stringify({
                type: "AUTHENTICATE",
                token: token.access_token,
            }))

            ws.current.onmessage = (message) => {
                const data = JSON.parse(message.data)

                if (data.type === "AUTHENTICATED") {
                    setReadyState("AUTHENTICATED")
                }
            }
        }

        ws.current.onerror = (error) => {
            setReadyState("ERROR")
            console.error("Socket error", error)
            ws.current.close()
        }

        ws.current.onclose = () => {
            setReadyState("CLOSED")
            reconnectTimeout.current = setTimeout(connectWebsocket, 1000)
        }
    }, [token])

    useEffect(() => {
        connectWebsocket()

        return () => {
            ws.current.onclose = null // disable reconnect
            ws.current.close()

            clearTimeout(reconnectTimeout.current)
        }
    }, [connectWebsocket])

    useEffect(() => {
        if (readyState === "AUTHENTICATED") {
            ws.current.onmessage = callback
        }
    }, [callback, readyState])

    return { ws, readyState }
}


function useHandledGateway() {
    const handlers = useRef([])

    const onMessage = (message) => {
        const data = JSON.parse(message.data)
        Promise.all(handlers.current.map(handler => handler(data))).catch(console.error)
    }

    const { ws, readyState } = useGateway(onMessage)

    const sendMessage = (message) => {
        if (readyState === "AUTHENTICATED") {
            ws.current.send(JSON.stringify(message))
        } else {
            console.log("Unable to send message", JSON.stringify(message), "socket is in state", readyState)
        }
    }

    const addHandler = (handler) => {
        handlers.current.push(handler)
    }

    const removeHandler = (handler) => {
        handlers.current = handlers.current.filter((h) => h !== handler)
    }

    return { sendMessage, addHandler, removeHandler, readyState }
}


export default function SocketProvider(props) {
    const handledGateway = useHandledGateway()

    return (
        <GatewayContext.Provider value={handledGateway}>
            {props.children}
        </GatewayContext.Provider>
    )
}