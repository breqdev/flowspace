import React from "react"
import { useHistory, useLocation } from "react-router-dom"
import { Formik, Form, Field } from "formik"

import AuthContext from "../AuthContext.js"
import { BASE_URL } from "../api.js"

import { Input, Button } from "./FormComponents.js"

export function DoVerify(props) {
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


export function DoReset(props) {
    const [, setToken] = React.useContext(AuthContext)

    const history = useHistory()

    const { search } = useLocation()

    return (
        <>
            <Formik
                initialValues={{password: ""}}
                onSubmit={async (values, actions) => {
                    const resetFormData = new URLSearchParams()
                    resetFormData.append("new_password", values.password)

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
                        <Field type="password" name="password" placeholder="new password" component={Input} />
                        <Button value="log in" />
                    </Form>
                )}
            </Formik>
        </>
    )
}