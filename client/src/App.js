import React from "react"

import AuthContext from "./AuthContext.js"
import LoggedOutView from "./LoggedOutView.js"
import LoggedInView from "./LoggedInView.js"

export default function App() {
    const [token] = React.useState(null)

    return (
        <AuthContext.Provider value={token}>
            {token
            ? <LoggedInView />
            : <LoggedOutView />}
        </AuthContext.Provider>
    )
}