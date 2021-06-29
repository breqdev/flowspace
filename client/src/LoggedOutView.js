import React from "react"

function FormWrapper(props) {
    return (
        <div className="flex flex-col min-h-screen items-center bg-gradient-to-r from-green-400 to-blue-500">
            <h1 className="text-white text-8xl my-24">Flowspace</h1>
            <div className="w-96 p-8 bg-white rounded-3xl flex flex-col text-center text-xl my-12">
                {props.children}
            </div>
        </div>
    )
}


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


function LoginForm(props) {

    const buttonIsValid = (
        /^[^\s@]+@[^\s@]+$/.test(props.user.email)
        && props.user.password.length > 4
    )

    return (
        <>
            <h1 className="text-3xl justify-self-start mb-8">Log In</h1>
            <form className="flex-grow flex flex-col h-80" onSubmit={props.onLogin}>
                <Input type="email" placeholder="email"
                value={props.user.email} onChange={e => props.onEdit({...props.user, email: e.target.value})}
                />
                <Input type="password" placeholder="password"
                value={props.user.password} onChange={e => props.onEdit({...props.user, password: e.target.value})}
                />
                <Button disabled={!buttonIsValid}>continue</Button>
            </form>
            <span>or <button className="justify-self-end underline" onClick={props.onSwitch}>sign up?</button></span>
        </>
    )
}


function SignupForm(props) {

    const buttonIsValid = (
        /^[^\s@]+@[^\s@]+$/.test(props.user.email)
        && props.user.password.length > 4
        && props.user.name.length
    )

    return (
        <>
            <h1 className="text-3xl justify-self-start mb-8">Sign Up</h1>
            <form className="flex-grow flex flex-col h-80" onSubmit={props.onSignup}>
            <Input type="email" placeholder="email"
                value={props.user.email} onChange={e => props.onEdit({...props.user, email: e.target.value})}
                />
                <Input type="password" placeholder="password"
                value={props.user.password} onChange={e => props.onEdit({...props.user, password: e.target.value})}
                />
                <Input type="text" placeholder="name"
                value={props.user.name} onChange={e => props.onEdit({...props.user, name: e.target.value})}
                />
                <Button disabled={!buttonIsValid}>continue</Button>
            </form>
            <span>or <button className="justify-self-end underline" onClick={props.onSwitch}>log in?</button></span>
        </>
    )
}


export default function LoggedOutView() {
    const [signup, setSignup] = React.useState(false)

    const [user, setUser] = React.useState({
        email: "",
        password: "",
        name: ""
    })

    const handleSignup = async (e) => {
        e.preventDefault()
    }

    const handleLogin = async (e) => {
        e.preventDefault()
    }

    return (
        <FormWrapper>
            {signup
            ? <SignupForm onSwitch={() => setSignup(false)} onSignup={handleSignup} user={user} onEdit={setUser} />
            : <LoginForm onSwitch={() => setSignup(true)} onLogin={handleLogin} user={user} onEdit={setUser} />}
        </FormWrapper>
    )
}