import React from "react"
import { Link, Redirect } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser, faLink, faMapMarkerAlt, faCommentDots, faUserFriends } from "@fortawesome/free-solid-svg-icons"


import { useAPI, BASE_URL } from "../api.js"


function UserInfo(props) {
    return (
        <div className="flex gap-4 items-center">
            <FontAwesomeIcon icon={props.icon} />
            {props.children}
        </div>
    )
}


function CtaButton(props) {
    let text, icon

    if (props.friends) {
        text = "chat"
        icon = faCommentDots
    } else {
        text = "send friend request"
        icon = faUserFriends
    }

    return (
        <div className="self-center p-4 border-2 border-black bg-white bg-opacity-75 flex gap-4 items-center rounded-xl cursor-pointer">
            <FontAwesomeIcon icon={icon} />
            {text}
        </div>
    )
}


export default function Profile(props) {
    const { id } = props.match.params

    const { data } = useAPI(`/profile/${id}`)

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
        <div className="max-w-6xl mx-auto w-full">
            <div className="md:m-16 p-8 md:p-16 md:rounded-3xl bg-gradient-to-r from-yellow-500 via-pink-400 to-purple-300">

                <div className="flex flex-wrap items-start justify-center gap-8 md:gap-16">

                    <div className="flex flex-col gap-8">
                        <img className="flex-grow-0 rounded-full w-64" alt="User profile" src={BASE_URL + "/profile/avatar/" + (data.avatarHash || "@default")} />
                        <CtaButton friends={false} />
                    </div>

                    <div className="flex-grow w-64 text-lg md:text-xl">
                        <h1 className="text-6xl mb-8 text-center sm:text-left">{data.name}</h1>
                        <div className="flex flex-col flex-wrap md:flex-row text-xl md:text-2xl justify-between md:gap-4 lg:gap-8">
                            {data.pronouns &&
                                <UserInfo icon={faUser}>
                                    {data.pronouns}
                                </UserInfo>
                            }
                            {data.url &&
                                <UserInfo icon={faLink}>
                                    <a className="underline" href={data.url}>{data.url}</a>
                                </UserInfo>
                            }
                            {data.location &&
                                <UserInfo icon={faMapMarkerAlt}>
                                    {data.location}
                                </UserInfo>
                            }
                        </div>
                        {data.bio &&
                            <>
                                <hr className="my-6 border-black" />
                                <div>
                                    {data.bio}
                                </div>
                            </>
                        }
                    </div>

                </div>

            </div>
        </div>
    )
}