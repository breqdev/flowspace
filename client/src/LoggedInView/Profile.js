import React from "react"
import { Link, Redirect } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser, faLink, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons"


import { useAPI, BASE_URL } from "../api.js"


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
        <div className="flex-grow m-4 md:m-16">
            <h1 className="text-6xl mb-4 text-center md:text-left">{props.name}</h1>
            <div className="flex flex-col md:flex-row text-xl justify-start md:gap-8">
                {props.pronouns &&
                    <UserInfo icon={faUser}>
                        {props.pronouns}
                    </UserInfo>
                }
                {props.url &&
                    <UserInfo icon={faLink}>
                        <a className="underline" href={props.url}>{props.url}</a>
                    </UserInfo>
                }
                {props.location &&
                    <UserInfo icon={faMapMarkerAlt}>
                        {props.location}
                    </UserInfo>
                }
            </div>
            {props.bio &&
                <>
                    <hr className="my-4 border-black" />
                    <div>
                        {props.bio}
                    </div>
                </>
            }
        </div>
    )
}


function BigProfile(props) {
    return (
        <img className="flex-grow-0 rounded-full md:w-96 m-8 md:m-16" alt="User profile" src={BASE_URL + "/profile/avatar/" + (props.hash || "@default")} />
    )
}


export default function Profile(props) {
    const { id } = props.match.params

    const { data, error } = useAPI(`/profile/${id}`)

    if (id === "@me" && data?.id) {
        return <Redirect to={`/profile/${data.id}`} />
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
        <div className="flex-grow w-full bg-gradient-to-r from-yellow-500 via-pink-400 to-purple-300">
            <div className="flex flex-col md:flex-row">
                <BigProfile hash={data?.avatarHash} />
                <UserCard {...data} />
            </div>
        </div>
    )
}