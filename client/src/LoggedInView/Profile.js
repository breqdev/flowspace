import React from "react"
import { Link, Redirect } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser, faLink, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons"


import { useAPI } from "../api.js"


function UserInfo(props) {
    return (
        <div className="flex gap-2 items-center">
            <FontAwesomeIcon icon={props.icon} />
            {props.children}
        </div>
    )
}


function UserCard(props) {
    return (
        <div className="m-4 md:m-16">
            <h1 className="text-6xl mb-4">{props.name}</h1>
            <div className="flex flex-col md:flex-row text-xl justify-between">
                <UserInfo icon={faUser}>
                    {props.pronouns}
                </UserInfo>
                <UserInfo icon={faLink}>
                    <a className="underline" href={props.url}>{props.url}</a>
                </UserInfo>
                <UserInfo icon={faMapMarkerAlt}>
                    {props.location}
                </UserInfo>
            </div>
            <hr className="my-4 border-black" />
            <div>
                {props.bio}
            </div>
        </div>
    )
}


function BigProfile(props) {
    return (
        <img className="rounded-full md:w-96 m-4 md:m-16" alt="User profile" src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" />
    )
}


export default function Profile(props) {
    const { id } = props.match.params

    const { data, error } = useAPI(`/profile/${id}`)

    if (id === "@me") {
        return <Redirect to={`/profile/${data?.id}`} />
    }

    if (error?.status === 404) {
        return (
            <div>
                <h1>profile not found</h1>
                <p>the requested user was not found.</p>
                <p>go <Link to="/">home?</Link></p>
            </div>
        )
    }

    return (
        <div className="flex-grow w-full bg-gradient-to-r from-yellow-500 via-pink-400 to-purple-300">
            <div className="flex flex-col md:flex-row justify-center">
                <BigProfile />
                <UserCard {...data} />
            </div>
        </div>
    )
}