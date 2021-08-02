import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser, faLink, faMapMarkerAlt, faCommentDots, faUserFriends, faBan, faClipboard } from "@fortawesome/free-solid-svg-icons"


import AuthContext from "../../AuthContext.js"
import { BASE_URL, fetchWithToken, useAPI } from "../../api.js"


function ProfileImage(props) {
    return (
        <div className="col-start-1 row-start-1 md:row-span-2">
            <img className="rounded-full max-w-sm w-full" alt="User profile" src={BASE_URL + "/profile/avatar/" + (props.hash || "@default")} />
        </div>
    )
}


function BigName(props) {
    return (
        <div className="col-start-1 row-start-2 md:col-start-2 lg:col-start-2 lg:col-span-2 md:row-start-1 md:justify-self-start">
            <h1 className="text-6xl text-center md:text-left">{props.name}</h1>
        </div>
    )
}


function RelationshipButton(props) {
    let className = "flex flex-col justify-center items-center h-20 w-24 m-1 p-2 border-2 border-black rounded-xl transition-colors duration-300 "

    if (props.color === "red") {
        className += "bg-red-400 hover:bg-red-600"
    } else if (props.color === "green") {
        className += "bg-green-300 hover:bg-green-400"
    } else if (props.color === "blue") {
        className += "bg-blue-300 hover:bg-blue-400"
    } else {
        className += "bg-white bg-opacity-50 hover:bg-opacity-100"
    }

    return (
        <div className={className} onClick={props.onClick}>
            <FontAwesomeIcon icon={props.icon} className="text-3xl" />
            <span className="text-xl">{props.text}</span>
        </div>
    )
}


function RelationshipButtons(props) {
    const [token, setToken] = React.useContext(AuthContext)

    const copiedMessage = React.useRef(null)

    const { data: relationship, mutate } = useAPI("/relationship/outgoing/:0", props.id)

    if (!relationship) {
        return <div className="col-start-1 row-start-3 flex" />
    }

    if (relationship.toId === relationship.fromId) {
        const profileURL = `${window.location.protocol}//${window.location.host}/profile/${props.id}`

        const copyLink = () => {
            navigator.clipboard.writeText(profileURL).then(() => {
                copiedMessage.current.style.opacity = 1

                setTimeout(() => {
                    if (copiedMessage.current) {
                        copiedMessage.current.style.opacity = 0
                    }
                }, 2000)
            })
        }

        return (
            <div className="col-start-1 row-start-3 justify-self-stretch flex flex-col">
                <span className="md:-mt-2 mb-2 text-center">
                    share your profile url
                </span>
                <div className="flex gap-4">
                    <span className="w-0 flex-grow p-3 bg-white border-2 border-black rounded-xl truncate">
                        {profileURL}
                    </span>
                    <span className="bg-green-400 rounded-xl px-4 py-3 border-2 border-black" onClick={copyLink}>
                        <FontAwesomeIcon icon={faClipboard} className="text-2xl" />
                    </span>
                </div>
                <span ref={copiedMessage} className="mt-1 md:-mb-6 text-center transition-opacity duration-200" style={{ opacity: 0 }}>
                    copied to clipboard!
                </span>
            </div>
        )
    }

    const setRelationship = async (type) => {
        const resp = await fetchWithToken("/relationship/outgoing/" + props.id, token, setToken, {
            method: "POST",
            body: {
                toId: props.id,
                type,
            }
        })

        if (resp.status_code === 200) {
            mutate(resp)
        } else {
            mutate({
                type: "NONE",
                ...relationship,
            })
        }
    }

    let relationshipButtons = []

    if (relationship.type === "NONE" || relationship.type === "BLOCK") {
        relationshipButtons.push(
            <RelationshipButton icon={faCommentDots} text="wave" key="wave"
            onClick={() => setRelationship("WAVE")}/>
        )
    } else {
        relationshipButtons.push(
            <RelationshipButton icon={faCommentDots} text="message" key="wave"
            onClick={() => console.log("message coming soon!")} color="blue" />
        )
    }

    if (relationship.type === "FOLLOW") {
        relationshipButtons.push(
            <RelationshipButton icon={faUserFriends} text="following" key="follow"
            onClick={() => setRelationship("WAVE")} color="green" />
        )
    } else {
        relationshipButtons.push(
            <RelationshipButton icon={faUserFriends} text="follow" key="follow"
            onClick={() => setRelationship("FOLLOW")} />
        )
    }

    if (relationship.type === "BLOCK") {
        relationshipButtons.push(
            <RelationshipButton icon={faBan} text="unblock" key="block" color="red"
            onClick={() => setRelationship("NONE")} />
        )
    } else {
        relationshipButtons.push(
            <RelationshipButton icon={faBan} text="block" key="block"
            onClick={() => setRelationship("BLOCK")} />
        )
    }

    return (
        <div className="col-start-1 row-start-3 flex">
            {relationshipButtons}
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
        <div className="col-start-1 row-start-4 md:col-start-2 lg:col-span-2 md:row-start-2 md:row-span-2 self-start justify-self-stretch">
            <UserInfoRow {...props} />
            <UserBio bio={props.bio} />
        </div>
    )
}


export default function UserCard(props) {
    return (
        <div className="md:m-16 p-12 md:rounded-3xl bg-gradient-to-r from-yellow-500 via-pink-400 to-purple-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 place-items-center gap-4 md:gap-12">
                <ProfileImage hash={props.user?.avatarHash} />
                <BigName name={props.user?.name} />
                <RelationshipButtons id={props.user?.id} />
                <UserInfoSection {...props.user} />
            </div>
        </div>
    )
}
