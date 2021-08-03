import React from "react"
import { Link, useHistory, useLocation } from "react-router-dom"
import { Formik, Form, Field } from "formik"

import AuthContext from "../AuthContext.js"
import { BASE_URL } from "../utils/api.js"

import { Input, Button } from "./FormComponents.js"
import { LoginSchema, SignupSchema, ForgotPasswordSchema, ResetPasswordSchema } from "./FormSchemas"


const postData = async (values, url) => {
    const formData = new URLSearchParams()

    for (let key in values) {
        if (values.hasOwnProperty(key)) {
            formData.set(key, values[key])
        }
    }

    const response = await fetch(BASE_URL + url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData
    })

    const data = await response.json()

    return { response, data }
}


export function LogIn(props) {
    const [, setToken] = React.useContext(AuthContext)

    const history = useHistory()

    return (
        <>
            <Formik
                initialValues={{email: "", password: ""}}
                validationSchema={LoginSchema}
                onSubmit={async (values, actions) => {
                    const { response, data } = await postData(values, "/auth/login")

                    if (response.ok) {
                        setToken(data)
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
                        <Button value="log in" />
                    </Form>
                )}
            </Formik>
            <span><Link to="/forgot" className="justify-self-end underline">forgot password?</Link></span>
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
                validationSchema={SignupSchema}
                onSubmit={async (values, actions) => {
                    const { response, data } = await postData(values, "/auth/signup")

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


export function ForgotPassword(props) {
    const history = useHistory()

    return (
        <>
            <Formik
                initialValues={{email: ""}}
                validationSchema={ForgotPasswordSchema}
                onSubmit={async (values, actions) => {
                    const { response, data } = await postData(values, "/auth/reset")

                    if (response.ok) {
                        history.push("/reset")
                    } else {
                        props.onError(data.msg)
                        history.push("/error")
                    }
                }}
            >
                {formik => (
                    <Form className="flex flex-col">
                        <Field type="email" name="email" placeholder="email" component={Input} />
                        <Button value="send password reset email" />
                    </Form>
                )}
            </Formik>
            <span>or <Link to="/" className="justify-self-end underline">log in?</Link></span>
        </>
    )
}


export function ResetPassword(props) {
    const [, setToken] = React.useContext(AuthContext)

    const history = useHistory()

    const { search } = useLocation()

    return (
        <>
            <Formik
                initialValues={{password: ""}}
                validationSchema={ResetPasswordSchema}
                onSubmit={async (values, actions) => {
                    const resetFormData = new URLSearchParams()
                    resetFormData.append("new_password", values.new_password)

                    // do password reset
                    const params = new URLSearchParams(search)

                    const resetToken = params.get("token")

                    const resetResponse = await fetch(BASE_URL + "/auth/password", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${resetToken}`,
                            "Content-Type": "application/x-www-form-urlencoded"
                        },
                        body: resetFormData
                    })

                    const resetJson = await resetResponse.json()

                    if (!resetResponse.ok) {
                        props.onError(resetJson.msg)
                        history.push("/error")
                        return
                    }

                    // do new login
                    const formData = new URLSearchParams()
                    formData.append("email", resetJson.email)
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
                        <Field type="password" name="new_password" placeholder="new password" component={Input} />
                        <Button value="log in" />
                    </Form>
                )}
            </Formik>
        </>
    )
}