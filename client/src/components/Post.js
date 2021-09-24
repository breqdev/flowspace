import React, { useContext } from "react"
import dayjs from "dayjs"
import { Link } from "react-router-dom"
import { avatarUrl, fetchWithToken, useAPI } from "../utils/api.js"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPencilAlt, faTrash } from "@fortawesome/free-solid-svg-icons"
import AuthContext from "../context/AuthContext.js"


function PostActions(props) {
    const className = "ml-2 text-gray-700 hover:text-black"

    const [token, setToken] = useContext(AuthContext)

    const handleDelete = async () => {
        await fetchWithToken(`/posts/${props.id}`, token, setToken, {
            method: "DELETE"
        })

        props.onMutate(posts => posts.filter(post => post.id !== props.id), false)
    }

    return (
        <div className="flex-grow text-right">
            <button className={className} onClick={handleDelete}>
                <FontAwesomeIcon icon={faTrash} />
            </button>
            <Link to={`/compose/${props.id}`} className={className}>
                <FontAwesomeIcon icon={faPencilAlt} />
            </Link>
        </div>
    )
}


function Comment(props) {
    const { data: author } = useAPI("/profile/:0", [props.authorId])

    return (
        <div className="flex gap-2">
            <img alt="" src={avatarUrl(author?.avatarHash, 64)} className="rounded-full h-6 w-6" />
            <span className="font-bold">{author?.name}</span>
            <span>{props.content}</span>
        </div>
    )
}


function Comments(props) {
    const { data } = useAPI("/comments/post/:0", [props.postId])

    return (
        <Link to={`/post/${props.postId}`} className="block border-t-2 border-black p-3">
            {(data && data.length > 0) ? (
                data.map(comment => <Comment key={comment.id} {...comment} />)
            ) : (
                <span>add a comment...</span>
            )}
        </Link>
    )
}


export default function Post(props) {
    const { data: currentUser } = useAPI("/auth/status")
    const { data: author } = useAPI("/profile/:0", [props.authorId])

    const createdAt = dayjs(props.createdAt).fromNow()
    const editedAt = (props.editedAt !== props.createdAt) ? dayjs(props.editedAt).fromNow() : null

    return (
        <article className="rounded-2xl border-black border-2">
            <Link to={`/profile/${author?.id}`} className="border-b-2 border-black p-3 text-xl flex items-center gap-3">
                <img alt="" src={avatarUrl(author?.avatarHash, 64)} className="rounded-full h-8 w-8" />
                <span>{author?.name}</span>
            </Link>
            <div className="p-3">
                <h2 className="text-3xl mb-2">{props.title}</h2>
                <p>{props.content}</p>
                <hr className="my-2" />
                <div className="text-gray-700 flex gap-2">
                    <span>created {createdAt}</span>
                    {editedAt && <span>· last edited {editedAt}</span>}
                    {props.authorId === currentUser?.id && <PostActions id={props.id} onMutate={props.onMutate} />}
                </div>
            </div>
            <Comments postId={props.id} />
        </article>
    )
}
