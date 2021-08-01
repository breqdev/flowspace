import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser, faLink, faMapMarkerAlt, faCommentDots, faUserFriends } from "@fortawesome/free-solid-svg-icons"


import { BASE_URL } from "../../api.js"


function ProfileImage(props) {
    return (
        <div className="col-start-1 row-start-1 md:row-span-2">
            <img className="rounded-full max-w-sm w-full" alt="User profile" src={BASE_URL + "/profile/avatar/" + (props.hash || "@default")} />
        </div>
    )
}


function BigName(props) {
    return (
        <div className="col-start-1 row-start-2 md:col-start-2 md:col-span-2 md:row-start-1 md:justify-self-start">
            <h1 className="text-6xl text-center md:text-left">{props.name}</h1>
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
        <div className="col-start-1 row-start-3">
            <div className="self-center m-2 p-4 border-2 border-black bg-white bg-opacity-50 hover:bg-opacity-75 transition-colors duration-300 flex gap-4 items-center rounded-xl cursor-pointer text-lg lg:text-xl">
                <FontAwesomeIcon icon={icon} />
                {text}
            </div>
        </div>
    )
}


function UserInfoItem(props) {
    return (
        <div className="flex gap-4 items-center justify-center">
            <FontAwesomeIcon icon={props.icon} />
            {props.children}
        </div>
    )
}


function UserInfoRow(props) {
    return (
        <div className="flex flex-col flex-wrap md:flex-row text-xl md:text-2xl justify-between md:gap-4">
            {props.pronouns &&
                <UserInfoItem icon={faUser}>
                    {props.pronouns}
                </UserInfoItem>
            }
            {props.url &&
                <UserInfoItem icon={faLink}>
                    <a className="underline" href={props.url}>{props.url}</a>
                </UserInfoItem>
            }
            {props.location &&
                <UserInfoItem icon={faMapMarkerAlt}>
                    {props.location}
                </UserInfoItem>
            }
        </div>
    )
}


function UserBio(props) {
    if (props.bio) {
        return (
            <>
                <hr className="my-3 border-black" />
                <div className="text-lg">
                    {props.bio}
                </div>
            </>
        )
    } else {
        return <></>
    }
}


function UserInfoSection(props) {
    return (
        <div className="col-start-1 row-start-4 md:col-start-2 md:col-span-2 md:row-start-2 md:row-span-2 self-start justify-self-stretch">
            <UserInfoRow {...props} />
            <UserBio bio={props.bio} />
        </div>
    )
}


export default function UserCard(props) {
    return (
        <div className="md:m-16 p-12 md:rounded-3xl bg-gradient-to-r from-yellow-500 via-pink-400 to-purple-300">
            <div className="grid grid-cols-1 md:grid-cols-3 place-items-center gap-4 md:gap-12">
                <ProfileImage hash={props.user?.avatarHash} />
                <BigName name={props.user?.name} />
                <CtaButton friends={false} />
                <UserInfoSection {...props.user} />
            </div>
        </div>
    )
}
