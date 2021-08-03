import React from "react"
import { Switch, Route, Redirect, useLocation } from "react-router-dom"

import { Error, PromptForVerify, PromptForReset } from "./Prompts.js"
import { LogIn, SignUp, ForgotPassword, ResetPassword } from "./Forms.js"
import { DoVerify } from "./Actions.js"


function VerifyEmail(props) {
    const { search } = useLocation()
    const params = new URLSearchParams(search)

    if (params.get("token")) {
        return <DoVerify onError={props.onError} />
    } else {
        return <PromptForVerify />
    }
}


function HandleReset(props) {
    const { search } = useLocation()
    const params = new URLSearchParams(search)

    if (params.get("token")) {
        return <ResetPassword onError={props.onError} />
    } else {
        return <PromptForReset />
    }
}


function LoggedOutView(props) {
    return (
        <div className="flex flex-col min-h-screen items-center bg-gradient-to-r from-green-400 to-blue-500">
            <h1 className="text-white text-6xl md:text-8xl mt-24 mb-12">flowspace</h1>
            <div className="self-stretch md:self-center mx-4 my-6 md:w-96 p-8 bg-white rounded-3xl flex flex-col text-center text-xl">
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
                <Route exact path="/forgot">
                    <ForgotPassword onError={setError} />
                </Route>
                <Route exact path="/reset">
                    <HandleReset onError={setError} />
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