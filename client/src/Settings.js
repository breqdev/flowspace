import React from "react"
import { NavLink, Switch, Route, Redirect, useHistory } from "react-router-dom"
import { Formik, Field, Form } from "formik"
import { mutate } from "swr"

import AuthContext from "./AuthContext.js"
import { useAPI, useFetcher } from "./api.js"

function Sidebar(props) {
    const items = props.items.map(
        item => <NavLink key={item} to={`/settings/${item}`} className="py-1 px-4" activeClassName="bg-green-300">{item}</NavLink>
    )

    return (
        <div className="flex flex-col m-4 w-48 rounded-xl border-2 divide-y overflow-hidden">
            {items}
        </div>
    )
}


function Input(props) {
    return (
        <label className="flex flex-col my-2">
            <span>{props.label || props.field.name}</span>
            <input className="rounded-md border-2 border-gray-200 focus:border-blue-500 outline-none px-3 py-2 my-2" type="text" {...props.field} />
        </label>
    )
}


function SettingsPane(props) {
    return (
        <div className="w-96 my-4">
            <h1 className="text-2xl text-center">{props.title} settings</h1>
            <hr className="my-4" />
            {props.children}
        </div>
    )
}


function SubmitButton(props) {
    return (
        <input type="submit" value={props.text || "submit"} className={props.className + " rounded-lg bg-green-300 disabled:bg-gray-200 hover:bg-green-500 transition-colors duration-300 p-4 my-2"} onClick={props.onClick} />
    )
}


const ToastContext = React.createContext()


function Toast(props) {
    const [expanded, setExpanded] = React.useState(false)

    const translate = expanded ? " translate-y-0" : " translate-y-32"

    const { message, clearMessage } = props

    React.useEffect(() => {
        if (message) {
            setExpanded(true)
        }

        let expandTimer = setTimeout(() => setExpanded(false), 2000)
        let messageTimer = setTimeout(() => clearMessage(), 2500)

        return () => {
            clearTimeout(expandTimer)
            clearTimeout(messageTimer)
        }
    }, [message, clearMessage])

    return (
        <div className="container fixed bottom-0 flex justify-center pointer-events-none">
            <div className={"w-1/2 my-16 transition-transform transform " + translate}>
                <div className="-mx-16 p-4 border-2 rounded-full shadow-2xl bg-green-300 flex justify-center">
                    {message}
                </div>
            </div>
        </div>
    )
}


function ProfileSettings(props) {
    const fetcher = useFetcher()
    const { data: currentProfile } = useAPI("/profile/@me")

    const toastMessage = React.useContext(ToastContext)

    const initialValues = currentProfile || {
        name: "",
        pronouns: "",
        url: "",
        location: "",
        bio: ""
    }

    return (
        <SettingsPane title="profile">
            <Formik
                initialValues={initialValues}
                enableReinitialize={true}
                onSubmit={async (values, actions) => {
                    await fetcher("/profile/@me", {
                        method: "POST",
                        body: JSON.stringify(values)
                    })
                    mutate("/profile/@me")
                    mutate("/auth/status")
                    toastMessage("saved successfully")
                }}
            >
                {formik => (
                    <Form className="flex flex-col">
                        <Field type="text" name="name" component={Input} />
                        <Field type="text" name="pronouns" component={Input} />
                        <Field type="url" name="url" component={Input} />
                        <Field type="text" name="location" component={Input} />
                        <label className="flex flex-col my-2">
                            bio
                            <Field component="textarea" name="bio"
                            className="rounded-md border-2 border-gray-200 focus:border-blue-500 outline-none px-3 py-2 my-2" />
                        </label>
                        <SubmitButton text="save" />
                    </Form>
                )}
            </Formik>
        </SettingsPane>
    )
}


function AccountSettings(props) {
    const { data: currentAccount } = useAPI("/auth/status")
    const [, setToken] = React.useContext(AuthContext)

    const fetch = useFetcher()
    const history = useHistory()

    const handleDeleteAccount = () => {
        fetch("/auth/delete", {
            method: "POST"
        }).then(() => {
            mutate("/auth/status")
            setToken(null)
            history.push("/")
        })
    }

    return (
        <SettingsPane title="account">
            <Formik
                initialValues={{email: currentAccount?.email || "", password: ""}}
                enableReinitialize={true}
                onSubmit={async (values, actions) => {
                }}
            >
                {formik => (
                    <Form className="flex flex-col">
                        <Field type="email" name="email" label="new email" component={Input} />
                        <Field type="password" name="password" component={Input} />
                        <SubmitButton text="change email" />
                    </Form>
                )}
            </Formik>

            <hr />

            <Formik
                initialValues={{old_password: "", new_password: ""}}
                enableReinitialize={true}
                onSubmit={async (values, actions) => {
                }}
            >
                {formik => (
                    <Form className="flex flex-col">
                        <Field type="password" name="old_password" label="old password" component={Input} />
                        <Field type="password" name="new_password" label="new password" component={Input} />
                        <SubmitButton text="change password" />
                    </Form>
                )}
            </Formik>

            <hr />

            <SubmitButton className="w-full" text="delete account" onClick={handleDeleteAccount} />
        </SettingsPane>
    )
}


export default function Settings(props) {
    const [message, setMessage] = React.useState(null)

    const toastMessage = (message) => {
        setMessage(message)
    }

    const clearMessage = React.useCallback(() => setMessage(""), [setMessage])

    return (
        <ToastContext.Provider value={toastMessage}>
            <div className="mx-auto px-4 flex justify-center items-start gap-8">
                <Sidebar items={["profile", "account"]}/>
                <Switch>
                    <Route path="/settings/profile" component={ProfileSettings} />
                    <Route path="/settings/account" component={AccountSettings} />
                    <Route path="/settings">
                        <Redirect to="/settings/profile" />
                    </Route>
                </Switch>
                <Toast message={message} clearMessage={clearMessage}/>
            </div>
        </ToastContext.Provider>
    )
}