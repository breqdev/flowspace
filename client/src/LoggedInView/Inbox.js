import { faBan, faUserFriends } from "@fortawesome/free-solid-svg-icons"
import React from "react"
import { Link } from "react-router-dom"
import { avatarUrl, useAPI, fetchWithToken } from "../utils/api"
import { RelationshipButton } from "./Profile/RelationshipButtons"
import AuthContext from "../context/AuthContext"



function User(props) {
    const [token, setToken] = React.useContext(AuthContext)

    const { data: user } = useAPI("/profile/:0", [props.id])

    const setRelationship = async (type) => {
        const resp = await fetchWithToken("/relationship/outgoing/" + props.id, token, setToken, {
            method: "POST",
            body: {
                toId: props.id,
                type,
            }
        })

        if (resp.status_code === 200) {
            props.onUserAction(props.id)
        }
    }

    return (
        <section className="bg-gradient-to-r from-yellow-500 via-pink-400 to-purple-300 rounded-2xl p-4 flex flex-col gap-4 items-stretch">
            <Link to={"/profile/" + user?.id} className="flex">
                <img src={avatarUrl(user?.avatarHash, 256)} alt={user?.name} className="rounded-full w-24 h-24" />
                <div className="flex-grow mx-4">
                    <h1 className="text-2xl line-clamp-1">{user?.name}</h1>
                    <hr className="border-black my-3" />
                    <p className="line-clamp-2">{user?.bio}</p>
                </div>
            </Link>
            <div className="flex justify-center">
                <RelationshipButton icon={faUserFriends} text="wave"
                onClick={() => setRelationship("WAVE")} color="green" />

                <RelationshipButton icon={faUserFriends} text="follow"
                onClick={() => setRelationship("FOLLOW")} color="blue" />

                <RelationshipButton icon={faBan} text="block" key="block"
                onClick={() => setRelationship("BLOCK")} color="red" />
            </div>
        </section>
    )
}



function IncomingList(props) {
    const { data: users, mutate } = useAPI("/relationship/inbox")

    const handleUserAction = (user) => {
        mutate(users.filter(u => u !== user))
    }

    if (users && users.length) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 w-full px-4 gap-8">
                {users.map(user => <User key={user} id={user} onUserAction={handleUserAction} />)}
            </div>
        )

    } else {
        return (
            <p className="text-center mx-8">
                when people wave or follow you, they'll show up here.
            </p>
        )
    }
}


export default function Inbox(props) {
    return (
        <div className="w-full max-w-7xl mx-auto">
            <h1 className="text-center text-4xl my-8">incoming</h1>
            <IncomingList />
        </div>
    )
}
