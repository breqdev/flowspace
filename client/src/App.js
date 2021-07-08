import React from "react"
import { BrowserRouter as Router } from "react-router-dom"

import AuthContext from "./AuthContext.js"
import LoggedOutView from "./LoggedOutView.js"
import LoggedInView from "./LoggedInView.js"


function useLocalStorageState(key, defaultValue) {
    const [value, setValue] = React.useState(() => {
        const localValue = localStorage.getItem(key)

        if (localValue !== null) {
            return JSON.parse(localValue)
        } else {
            return defaultValue
        }
    })

    React.useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value))
    }, [key, value])

    return [value, setValue]
}


export default function App() {
    const [token, setToken] = useLocalStorageState("token", null)

    return (
        <Router>
            <AuthContext.Provider value={[token, setToken]}>
                {token
                ? <LoggedInView />
                : <LoggedOutView />}
            </AuthContext.Provider>
        </Router>
    )
}