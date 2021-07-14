import React from "react"
import { Link, useHistory } from "react-router-dom"
import { Formik, Form, Field } from "formik"

import AuthContext from "../AuthContext.js"
import { BASE_URL } from "../api.js"

import { Input, Button } from "./FormComponents.js"

export function LogIn(props) {
    const [, setToken] = React.useContext(AuthContext)

    const history = useHistory()

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

                    if (response.ok) {
                        setToken(token)
                    } else {
                        props.onError(token.msg)
                        history.push("/error")
                    }
                }}
            >
                {formik => (
                    <Form className="flex flex-col">
                        <Field type="email" name="email" placeholder="email" component={Input} />
                        <Field type="password" name="password" placeholder="password" component={Input} />
                        <Button value="log in" />
                        <button className="underline my-1 disabled:text-gray-500 disabled:cursor-not-allowed" value="forgot password" disabled={!formik.values.email} onClick={async (e) => {
                            e.preventDefault()

                            const formData = new URLSearchParams()
                            formData.append("email", formik.values.email)

                            const response = await fetch(BASE_URL + "/auth/reset", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded"
                                },
                                body: formData
                            })
                            if (!response.ok) {
                                props.onError(response.msg)
                            }

                            history.push("/reset")
                        }}>forgot password</button>
                    </Form>
                )}
            </Formik>
            <span>or <Link to="/signup" className="justify-self-end underline">sign up?</Link></span>
        </>
    )
}


export function SignUp(props) {
    const history = useHistory()

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
                        history.push("/verify")
                    } else {
                        props.onError(data.msg)
                        history.push("/error")
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

