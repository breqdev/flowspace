import React from "react"
import { NavLink, Switch, Route, Redirect, useHistory } from "react-router-dom"
import { Formik, Field, Form } from "formik"
import { mutate as globalMutate } from "swr"

import AuthContext from "../context/AuthContext.js"
import { useAPI, fetchWithToken, avatarUrl } from "../utils/api.js"

function Sidebar(props) {
    const items = props.items.map(
        item => <NavLink key={item} to={`/settings/${item}`} className="py-1 px-4" activeClassName="bg-green-300">{item}</NavLink>
    )

    return (
        <div className="flex flex-col self-stretch md:self-auto m-4 md:w-48 rounded-xl border-2 divide-y overflow-hidden">
            {items}
        </div>
    )
}


function Input(props) {
    return (
        <label className="flex flex-col my-2">
            <span>{props.label || props.field.name}</span>
            <input className="rounded-md border-2 border-gray-200 focus:border-blue-500 outline-none px-3 py-2 my-2" type={props.type || "text"} {...props.field} />
        </label>
    )
}


function SettingsPane(props) {
    return (
        <div className="md:w-96 my-4">
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
        <div className="fixed bottom-0 w-screen flex justify-center pointer-events-none">
            <div className={"md:w-1/2 my-16 transition-transform transform " + translate}>
                <div className="md:-mx-16 px-8 py-4 border-2 rounded-full shadow-2xl bg-green-300 flex justify-center">
                    {message}
                </div>
            </div>
        </div>
    )
}


function ProfileSettings(props) {
    const { data, mutate } = useAPI("/profile/@me")
    const [token, setToken] = React.useContext(AuthContext)

    const toastMessage = React.useContext(ToastContext)

    const initialValues = {
        name: data?.name || "",
        pronouns: data?.pronouns || "",
        url: data?.url || "",
        location: data?.location || "",
        bio: data?.bio || ""
    }

    return (
        <SettingsPane title="profile">
            <Formik
                initialValues={initialValues}
                enableReinitialize={true}
                onSubmit={async (values, actions) => {
                    await fetchWithToken("/profile/@me", token, setToken, {
                        method: "POST",
                        body: values
                    })
                    mutate(values)
                    globalMutate("/auth/status")
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
    const { data, mutate } = useAPI("/auth/status")
    const [token, setToken] = React.useContext(AuthContext)

    const history = useHistory()

    const toastMessage = React.useContext(ToastContext)

    const handleDeleteAccount = () => {
        fetchWithToken("/auth/delete", token, setToken, {
            method: "POST"
        }).then(() => {
            mutate()
            setToken(null)
            history.push("/")
        })
    }

    return (
        <SettingsPane title="account">
            <Formik
                initialValues={{email: data?.email || "", password: ""}}
                enableReinitialize={true}
                onSubmit={async (values, actions) => {
                    const data = new URLSearchParams()
                    data.append("email", values.email)
                    data.append("password", values.password)

                    const response = await fetchWithToken("/auth/email", token, setToken, {
                        method: "POST",
                        body: data
                    })

                    if (response.ok) {
                        setToken(null)
                        history.push("/verify")
                    } else {
                        const msg = response.msg
                        toastMessage(msg)
                    }
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
                    const data = new URLSearchParams()
                    data.append("password", values.old_password)
                    data.append("new_password", values.new_password)

                    const response = await fetchWithToken("/auth/password", token, setToken, {
                        method: "POST",
                        body: data
                    })

                    if (response.ok) {
                        setToken(null)
                        history.push("/")
                    } else {
                        const msg = response.msg
                        toastMessage(msg)
                    }
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


function Avatar(props) {
    return <img alt="User Avatar" className="rounded-full w-64" src={avatarUrl(props.hash, 1024)} />
}


function AvatarSettings(props) {
    const { data, mutate } = useAPI("/profile/@me")
    const [token, setToken] = React.useContext(AuthContext)

    const [file, setFile] = React.useState(null)

    const toastMessage = React.useContext(ToastContext)

    const handleSubmit = async (e) => {
        e.preventDefault()

        const formData = new FormData()
        formData.append("avatar", file)

        const response = await fetchWithToken("/profile/avatar/@me", token, setToken, {
            method: "POST",
            body: formData,
        })

        if (response.ok) {
            mutate({ ...data, avatarHash: response.avatarHash })
            toastMessage("saved successfully")
        } else {
            toastMessage("error: " + response.msg)
        }
    }

    const currentFileName = (file?.name || "")

    return (
        <SettingsPane title="avatar">
            <div className="flex flex-col items-center">
                <Avatar hash={data?.avatarHash} />
                <p className="my-4 text-xl">current avatar</p>
            </div>
            <hr />
            <div className="flex gap-4">
            <label className="flex-grow rounded-lg bg-gray-200 hover:bg-gray-400 transition-colors duration-300 p-4 my-2 overflow-hidden overflow-ellipsis whitespace-nowrap">
                choose file - {currentFileName || "none selected"}
                <input type="file" name="avatar" accept="image/*" onChange={(e) => {setFile(e.target.files[0])}} className="hidden" />
            </label>
            <SubmitButton text="upload" onClick={handleSubmit} />
        </div>
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
            <div className="w-full my-4 px-4 flex flex-col md:flex-row justify-center md:gap-8 items-stretch md:items-start">
                <Sidebar items={["profile", "account", "avatar"]}/>
                <Switch>
                    <Route path="/settings/profile" component={ProfileSettings} />
                    <Route path="/settings/account" component={AccountSettings} />
                    <Route path="/settings/avatar" component={AvatarSettings} />
                    <Route path="/settings">
                        <Redirect to="/settings/profile" />
                    </Route>
                </Switch>
            </div>
            <Toast message={message} clearMessage={clearMessage}/>
        </ToastContext.Provider>
    )
}