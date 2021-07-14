import React from "react"
import { Switch, Route, Redirect, useLocation } from "react-router-dom"

import { Error, PromptForVerify, PromptForReset } from "./Prompts.js"
import { LogIn, SignUp } from "./Forms.js"
import { DoVerify, DoReset } from "./Actions.js"


function VerifyEmail(props) {
    const { search } = useLocation()
    const params = new URLSearchParams(search)

    if (params.get("token")) {
        return <DoVerify onError={props.onError} />
    } else {
        return <PromptForVerify />
    }
}


function ResetPassword(props) {
    const { search } = useLocation()
    const params = new URLSearchParams(search)

    if (params.get("token")) {
        return <DoReset onError={props.onError} />
    } else {
        return <PromptForReset />
    }
}


function LoggedOutView(props) {
    return (
        <div className="flex flex-col min-h-screen items-center bg-gradient-to-r from-green-400 to-blue-500">
            <h1 className="text-white text-8xl my-24">flowspace</h1>
            <div className="w-96 p-8 bg-white rounded-3xl flex flex-col text-center text-xl my-12">
                {props.children}
            </div>
        </div>
    )
}

export default function RedirectingView(props) {
    const [error, setError] = React.useState()

    return (
        <LoggedOutView>
            <Switch>
                <Route exact path="/">
                    <LogIn onError={setError} />
                </Route>
                <Route exact path="/signup">
                    <SignUp onError={setError} />
                </Route>
                <Route exact path="/verify">
                    <VerifyEmail onError={setError} />
                </Route>
                <Route exact path="/reset">
                    <ResetPassword onError={setError} />
                </Route>
                <Route exact path="/error">
                    <Error reason={error} />
                </Route>
                <Route path="/">
                    <Redirect to="/" />
                </Route>
            </Switch>
        </LoggedOutView>
    )
}