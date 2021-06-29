import React from "react"

import AuthContext from "./AuthContext.js"


function Input(props) {
    return (
        <input
        className="rounded-full border-2 border-gray-200 focus:border-blue-500 outline-none px-6 py-4 my-2"
        {...props}
        />
    )
}


function Button(props) {
    return (
        <button {...props} className="rounded-full bg-green-300 disabled:bg-gray-200 hover:bg-green-500 transition-colors duration-300 p-4 my-2">
            {props.children}
        </button>
    )
}


export default function LoggedOutView(props) {
    const [token, setToken] = React.useContext(AuthContext)

    const [signup, setSignup] = React.useState(false)

    const [user, setUser] = React.useState({
        email: "",
        password: "",
        name: ""
    })

    const handleSubmit = async (e) => {
        e.preventDefault()

        const formData = new URLSearchParams()
        formData.append("email", user.email)
        formData.append("password", user.password)
        if (signup) {
            formData.append("name", user.name)
        }

        const response = await fetch("http://localhost:5000/auth/" + (signup ? "signup" : "login"), {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData
        })

        const token = await response.json()

        setToken(token)
    }

    const buttonIsValid = (
        /^[^\s@]+@[^\s@]+$/.test(user.email)
        && user.password.length > 4
        && !(signup && !user.name.length)
    )

    return (
        <div className="flex flex-col min-h-screen items-center bg-gradient-to-r from-green-400 to-blue-500">
            <h1 className="text-white text-8xl my-24">flowspace</h1>
            <div className="w-96 p-8 bg-white rounded-3xl flex flex-col text-center text-xl my-12">
                <form className="flex-grow flex flex-col h-80" onSubmit={handleSubmit}>
                <Input type="email" name="email" placeholder="email"
                    value={user.email} onChange={e => setUser({...user, email: e.target.value})}
                    />
                    <Input type="password" name="password" placeholder="password"
                    value={user.password} onChange={e => setUser({...user, password: e.target.value})}
                    />
                    {signup &&
                        <Input type="text" name="name" placeholder="name"
                        value={user.name} onChange={e => setUser({...user, name: e.target.value})}
                        />
                    }
                    <Button disabled={!buttonIsValid}>{signup ? "sign up" : "log in"}</Button>
                </form>
                <span>or <button className="justify-self-end underline" onClick={() => setSignup(!signup)}>{!signup ? "sign up" : "log in"}?</button></span>
            </div>
        </div>
    )
}