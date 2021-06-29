import React from "react"
import useLocalStorageState from "use-local-storage-state"

import AuthContext from "./AuthContext.js"
import LoggedOutView from "./LoggedOutView.js"
import LoggedInView from "./LoggedInView.js"

export default function App() {
    const [token, setToken] = useLocalStorageState("token", null)

    return (
        <AuthContext.Provider value={token}>
            {token
            ? <LoggedInView setToken={setToken} />
            : <LoggedOutView setToken={setToken} />}
        </AuthContext.Provider>
    )
}