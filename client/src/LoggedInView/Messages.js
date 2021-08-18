import { faAngleLeft, faPaperPlane } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Field, Form, Formik } from "formik"
import React from "react"
import { Link } from "react-router-dom"
import { avatarUrl, useAPI } from "../utils/api"


function User(props) {
    const { data: user } = useAPI("/profile/:0", [props.id])

    return (
        <li className="flex">
            <button className="flex-grow m-4 bg-white rounded-xl p-4 flex h-24 gap-6 items-center" onClick={props.onFocus}>
                <img src={avatarUrl(user?.avatar, 256)} className="h-full rounded-full" alt={user?.name} />
                <div className="flex-grow">
                    <h3 className="text-left text-xl">{user?.name}</h3>
                </div>
            </button>
        </li>
    )
}


function UsersList(props) {
    return (
        <div className={"max-w-sm w-full flex flex-col gap-2 py-4 bg-green-100 md:block " + (props.mobileExpanded ? "block" : "hidden")}>
            <h1 className="text-center text-xl">messages</h1>
            <ul className="flex-grow">
                {props.users ? props.users.map(
                    user => <User key={user} id={user} onFocus={() => props.onFocusUser(user)} />
                ) : null}
            </ul>
        </div>
    )
}


function MessageComposeBox(props) {
    return (
        <Formik
            initialValues={{ message: "" }}
            onSubmit={() => {}}
        >
            {formik => (
                <Form className="flex p-4 gap-4">
                    <Field name="message" type="text" className="flex-grow bg-gray-100 py-2 px-4 rounded-full outline-none border-gray-100 focus:border-gray-400 border-2" />
                    <button type="submit" className="rounded-full bg-gray-100 hover:bg-gray-400 w-16 transition duration-300">
                        <span className="sr-only">send</span>
                        <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                </Form>
            )}
        </Formik>
    )
}


function EmptyChatWindow(props) {
    return (
        <div className="flex-grow bg-gray-100" />
    )
}


function ChatWindow(props) {
    const { data: user } = useAPI("/profile/:0", [props.id])

    return (
        <div className={"flex-grow flex-col md:flex " + (props.mobileExpanded ? "flex" : "hidden")}>
            {props.id ? (
                <>
                    <div className="bg-gray-100 flex p-4">
                        <h1 className="text-3xl flex gap-4 items-center">
                            <button className="inline-block md:hidden" onClick={props.onMobileExit}>
                                <FontAwesomeIcon icon={faAngleLeft} />
                            </button>
                            <Link to={`/profile/${props.id}`}>
                                {user?.name}
                            </Link>
                        </h1>
                    </div>
                    <div className="flex-grow flex items-center justify-center">
                        <p>messages will go here... eventually</p>
                    </div>
                    <MessageComposeBox />
                </>
            ) : <EmptyChatWindow /> }
        </div>
    )
}



export default function Messages(props) {
    const { data: users } = useAPI("/relationship/mutual", [], {
        onSuccess: (data) => {
            if (!focusedUser) {
                setFocusedUser(data[0])
            }
        }
    })

    const [focusedUser, setFocusedUser] = React.useState(users?.[0])

    if (users && focusedUser && !users.includes(focusedUser)) {
        setFocusedUser(users?.[0])
    }

    const [mobileUserExpanded, setMobileUserExpanded] = React.useState(false)

    const handleFocusUser = (user) => {
        setFocusedUser(user)
        setMobileUserExpanded(true)
    }

    return (
        <div className="flex items-stretch h-full">
            <UsersList users={users} onFocusUser={handleFocusUser} mobileExpanded={!mobileUserExpanded} />
            <ChatWindow id={focusedUser} mobileExpanded={mobileUserExpanded} onMobileExit={() => setMobileUserExpanded(false)} />
        </div>
    )
}
