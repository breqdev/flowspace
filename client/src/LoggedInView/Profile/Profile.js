import React from "react"
import { Link, Redirect } from "react-router-dom"


import { useAPI } from "../../api.js"


import UserCard from "./UserCard.js"


export default function Profile(props) {
    const { id } = props.match.params

    const { data: status } = useAPI("/auth/status")
    const { data } = useAPI("/profile/:0", (id === "@me" ? null : id))

    if (id === "@me" && status) {
        console.log("redirecting...")
        return <Redirect to={`/profile/${status.id}`} />
    }

    if (data?.status_code === 404) {
        return (
            <div className="text-center text-xl m-4">
                <h1 className="text-3xl mb-4">profile not found</h1>
                <p>the requested user was not found.</p>
                <p>go <Link to="/" className="underline">home?</Link></p>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto w-full">
            <UserCard user={data} />
        </div>
    )
}