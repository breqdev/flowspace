import React from "react"
import { BrowserRouter as Router } from "react-router-dom"
import useLocalStorageState from "use-local-storage-state"

import AuthContext from "./AuthContext.js"
import LoggedOutView from "./LoggedOutView/LoggedOutView.js"
import LoggedInView from "./LoggedInView.js"



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