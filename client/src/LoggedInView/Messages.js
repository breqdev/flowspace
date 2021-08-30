import { faAngleLeft, faPaperPlane } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Field, Form, Formik } from "formik"
import React, { useContext } from "react"
import { Link, Route, Switch } from "react-router-dom"
import useWebSocket from "react-use-websocket"
import AuthContext from "../context/AuthContext"
import { avatarUrl, fetchWithToken, useAPI } from "../utils/api"


function User(props) {
    const { data: user } = useAPI("/profile/:0", [props.id])

    return (
        <li className="flex">
            <Link to={`/messages/${props.id}`} className="flex-grow m-4 bg-white rounded-xl p-4 flex h-24 gap-6 items-center">
                <img src={avatarUrl(user?.avatar, 256)} className="h-full rounded-full" alt={user?.name} />
                <div className="flex-grow">
                    <h3 className="text-left text-xl">{user?.name}</h3>
                </div>
            </Link>
        </li>
    )
}


function UsersList(props) {
    const { data: users } = useAPI("/relationship/mutual")

    let className = "max-w-sm w-full flex flex-col gap-2 py-4 bg-green-100 "
    if (props.hiddenOnMobile) {
        className += "hidden md:flex"
    }

    return (
        <div className={className}>
            <h1 className="text-center text-xl">messages</h1>
            <ul className="flex-grow">
                {users ? users.map(
                    user => <User key={user} id={user} />
                ) : null}
            </ul>
        </div>
    )
}


function MessageComposeBox(props) {
    const [token, setToken] = useContext(AuthContext)

    const handleSubmit = async (values, actions) => {
        await fetchWithToken(`/messages/direct/${props.id}`, token, setToken, {
            method: "POST",
            body: {
                content: values.message,
            }
        })

        props.onSendMessage(values.message)
        actions.resetForm()
    }

    return (
        <Formik
            initialValues={{ message: "" }}
            onSubmit={handleSubmit}
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

function Message(props) {
    const { data: user } = useAPI("/profile/:0", [props.authorId])

    return (
        <div className="flex gap-4">
            <div className="h-16">
                <img src={avatarUrl(user?.avatarHash, 256)} className="h-full rounded-full" alt={user?.name} />
            </div>
            <div className="flex flex-col">
                <span className="font-bold">{user?.name}</span>
                <span>{props.content}</span>
            </div>
        </div>
    )
}


function MessageList(props) {
    return (
        <div className="flex-grow overflow-y-scroll h-0">
            <div className="flex flex-col p-4 gap-4">
                {props.messages ? props.messages.map(message => <Message key={message.id} {...message} />) : null}
            </div>
        </div>
    )
}


function ChatWindow(props) {
    const id = props.match.params.id
    const { data: currentUser } = useAPI("/profile/@me")
    const { data: user } = useAPI("/profile/:0", [id])
    const { data: messages, mutate } = useAPI("/messages/direct/:0", [id])

    const handleSendMessage = (content) => {
        mutate([...messages, {
            content,
            authorId: currentUser?.id,
        }])
    }

    return (
        <>
            <UsersList hiddenOnMobile />
            <div className="flex-grow flex flex-col">
                {id ? (
                    <>
                        <div className="bg-gray-100 flex p-4">
                            <h1 className="text-3xl flex gap-4 items-center">
                                <Link to="/messages">
                                    <FontAwesomeIcon icon={faAngleLeft} />
                                </Link>
                                <Link to={`/profile/${id}`}>
                                    {user?.name}
                                </Link>
                            </h1>
                        </div>
                        <MessageList id={id} messages={messages} />
                        <MessageComposeBox id={props.id} onSendMessage={handleSendMessage} />
                    </>
                ) : <EmptyChatWindow /> }
            </div>
        </>
    )
}



export default function Messages(props) {
    return (
        <div className="flex items-stretch flex-grow">
            <Switch>
                <Route path="/messages/:id" component={ChatWindow} />
                <Route path="/messages" component={UsersList} />
            </Switch>
        </div>
    )
}
