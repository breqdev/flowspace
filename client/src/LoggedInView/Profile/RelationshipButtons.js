import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCommentDots, faUserFriends, faBan, faClipboard } from "@fortawesome/free-solid-svg-icons"


import AuthContext from "../../context/AuthContext.js"
import { fetchWithToken, useAPI } from "../../utils/api.js"
import { encode } from "../../utils/bigintToBase64"
import { Link } from "react-router-dom"

export function RelationshipButton(props) {
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


function ProfileURLCopyRow(props) {
    const copiedMessage = React.useRef(null)

    const profileURL = `${window.location.protocol}//${window.location.host}/u/${encode(props.id)}`

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


function ProfileInteractionButtons(props) {
    const { relationship } = props

    const [token, setToken] = React.useContext(AuthContext)

    const setRelationship = async (type) => {
        const resp = await fetchWithToken("/relationship/outgoing/" + props.id, token, setToken, {
            method: "POST",
            body: {
                toId: props.id,
                type,
            }
        })

        if (resp.status_code === 200) {
            props.mutate(resp)
        } else {
            props.mutate({
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
            <Link to={`/messages/${props.id}`}>
                <RelationshipButton icon={faCommentDots} text="message" key="wave" color="blue" />
            </Link>
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


export default function RelationshipButtons(props) {
    const { data: relationship, mutate } = useAPI("/relationship/outgoing/:0", [props.id])

    if (!relationship) {
        // no data, return an empty row
        return <div className="col-start-1 row-start-3 flex" />
    }

    if (relationship.toId === relationship.fromId) {
        // let the user copy their own profile URL
        return <ProfileURLCopyRow id={props.id} />
    }

    // it's someone else's profile, show buttons
    return <ProfileInteractionButtons id={props.id} relationship={relationship} mutate={mutate} />

}