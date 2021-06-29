import React from "react"
import useLocalStorageState from "use-local-storage-state"
import { BrowserRouter as Router } from "react-router-dom"

import AuthContext from "./AuthContext.js"
import LoggedOutView from "./LoggedOutView.js"
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