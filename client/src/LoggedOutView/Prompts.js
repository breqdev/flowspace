import React from "react"
import { useHistory } from "react-router-dom"

export function Error(props) {
    const history = useHistory()

    return (
        <>
            <h2 className="text-2xl mb-4">something went wrong</h2>
            <hr />
            <p className="text-lg my-2">{props.reason}</p>
            <span>go <button className="justify-self-end underline" onClick={() => history.goBack()}>back?</button></span>
        </>
    )
}

export function PromptForVerify(props) {
    return (
        <>
            <h2 className="text-2xl mb-4">one more thing</h2>
            <hr />
            <p className="text-lg my-2">
                we need you to verify your email address.
                click the link in the email you received.
            </p>
        </>
    )
}


export function PromptForReset(props) {
    return (
        <>
            <h2 className="text-2xl mb-4">one more thing</h2>
            <hr />
            <p className="text-lg my-2">
                to reset your password, click the link in the email you received.
            </p>
        </>
    )
}