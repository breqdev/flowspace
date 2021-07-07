import React from "react"
import { Switch, Route, Redirect, Link, useHistory, useLocation } from "react-router-dom"
import { Formik, Form, Field } from "formik"

import AuthContext from "./AuthContext.js"
import { BASE_URL } from "./api.js"


function Input(props) {
    return (
        <input
        className="rounded-full border-2 border-gray-200 focus:border-blue-500 outline-none px-6 py-4 my-2"
        {...props} {...props.field}
        />
    )
}


function Button(props) {
    return (
        <input type="submit" {...props} className="rounded-full bg-green-300 disabled:bg-gray-200 hover:bg-green-500 transition-colors duration-300 p-4 my-2" />
    )
}


function LogIn(props) {
    const [, setToken] = React.useContext(AuthContext)

    return (
        <>
            <Formik
                initialValues={{email: "", password: ""}}
                onSubmit={async (values, actions) => {
                    const formData = new URLSearchParams()
                    formData.append("email", values.email)
                    formData.append("password", values.password)

                    const response = await fetch(BASE_URL + "/auth/login", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        },
                        body: formData
                    })

                    const token = await response.json()

                    setToken(token)
                }}
            >
                {formik => (
                    <Form className="flex flex-col">
                        <Field type="email" name="email" placeholder="email" component={Input} />
                        <Field type="password" name="password" placeholder="password" component={Input} />
                        <Button value="log in" />
                    </Form>
                )}
            </Formik>
            <span>or <Link to="/signup" className="justify-self-end underline">sign up?</Link></span>
        </>
    )
}


function SignUp(props) {
    const [submitted, setSubmitted] = React.useState({
        status: "pending",
        error: undefined
    })

    if (submitted.status === "success") {
        return <Redirect to="/verify" />
    }

    if (submitted.status === "error") {
        props.onError(submitted.error)
        return <Redirect to="/error" />
    }

    return (
        <>
            <Formik
                initialValues={{email: "", password: "", name: ""}}
                onSubmit={async (values, actions) => {
                    const formData = new URLSearchParams()
                    formData.append("email", values.email)
                    formData.append("password", values.password)
                    formData.append("name", values.name)

                    const response = await fetch(BASE_URL + "/auth/signup", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        },
                        body: formData
                    })

                    const data = await response.json()

                    if (response.ok) {
                        setSubmitted({
                            status: "success",
                            error: undefined
                        })
                    } else {
                        setSubmitted({
                            status: "error",
                            error: data.msg
                        })
                    }
                }}
            >
                {formik => (
                    <Form className="flex flex-col">
                        <Field type="email" name="email" placeholder="email" component={Input} />
                        <Field type="password" name="password" placeholder="password" component={Input} />
                        <Field type="text" name="name" placeholder="name" component={Input} />
                        <Button value="sign up" />
                    </Form>
                )}
            </Formik>
            <span>or <Link to="/" className="justify-self-end underline">log in?</Link></span>
        </>
    )
}



function Error(props) {
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


function PromptForVerify(props) {
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



function DoVerify(props) {
    const [, setToken] = React.useContext(AuthContext)

    const { search } = useLocation()

    React.useEffect(() => {
        const params = new URLSearchParams(search)

        async function doVerify() {
            const refresh_token = params.get("token")

            const refresh_response = await fetch(BASE_URL + "/auth/verify", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${refresh_token}`
                }
            })

            const new_token = await refresh_response.json()

            setToken({refresh_token, ...new_token})
        }

        doVerify()
    }, [setToken, search])

    return (
        <>
            <h2 className="text-2xl mb-4">just a sec</h2>
            <hr />
            <p className="text-lg my-2">
                validating your email address now...
            </p>
        </>
    )
}


function VerifyEmail(props) {
    const { search } = useLocation()
    const params = new URLSearchParams(search)

    if (params.get("token")) {
        return <DoVerify />
    } else {
        return <PromptForVerify />
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
                    <VerifyEmail />
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