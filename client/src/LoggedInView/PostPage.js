import { faPaperPlane, faPencilAlt, faTrash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Field, Form, Formik } from "formik"
import React, { useContext } from "react"
import AuthContext from "../context/AuthContext"

import { avatarUrl, fetchWithToken, useAPI } from "../utils/api"


function CommentInput(props) {

    const [token, setToken] = useContext(AuthContext)

    const submitComment = async (values, actions) => {
        const response = await fetchWithToken(`/comments/post/${props.postId}`, token, setToken, {
            method: "POST",
            body: values
        })
        props.onPost(response)
        actions.resetForm()
    }

    return (
        <Formik
            initialValues={{ content: "" }}
            onSubmit={submitComment}
        >
            {formik => (
                <Form className="flex w-full gap-4">
                    <Field name="content" type="text" placeholder="add a comment..." className="border-b-2 border-black flex-grow focus:border-green-300 outline-none" />
                    <button type="submit" className="text-xl ">
                        <span className="sr-only">send</span>
                        <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                </Form>
            )}
        </Formik>
    )
}


function CommentActions(props) {
    const [token, setToken] = useContext(AuthContext)

    const handleDelete = async () => {
        await fetchWithToken(`/comments/${props.id}`, token, setToken, {
            method: "DELETE"
        })
        props.onDelete({ id: props.id})
    }

    const handleEdit = async () => {
        return; // not yet impl
        // props.onEdit(props)
    }

    return (
        <div className="flex gap-2">
            <button onClick={handleDelete}>
                <FontAwesomeIcon icon={faTrash} />
            </button>
            <button onClick={handleEdit}>
                <FontAwesomeIcon icon={faPencilAlt} />
            </button>
        </div>
    )
}


function Comment(props) {
    const { data: author } = useAPI("/profile/:0", [props.authorId])

    return (
        <div className="flex my-4 gap-4">
            <img alt="" src={avatarUrl(author?.avatarHash, 64)} className="rounded-full h-16 w-16" />
            <div className="flex flex-col text-lg w-full">
                <div className="flex w-full">
                    <span className="font-bold">{author?.name}</span>
                    <div className="flex-grow" />
                    <CommentActions id={props.id} onEdit={props.onEdit} onDelete={props.onDelete} />
                </div>
                <span>{props.content}</span>
            </div>
        </div>
    )
}



export default function PostPage(props) {
    const { data } = useAPI("/posts/:0", [props.match.params.id])
    const { data: author } = useAPI("/profile/:0", [data?.authorId])
    const { data: comments, mutate } = useAPI("/comments/post/:0", [props.match.params.id])

    const handleNewComment = async (comment) => {
        mutate([...comments, comment])
    }

    const handleEditComment = async (comment) => {
        mutate(comments.map(c => c.id === comment.id ? comment : c))
    }

    const handleDeleteComment = async (comment) => {
        mutate(comments.filter(c => c.id !== comment.id))
    }


    return (
        <div className="flex flex-col max-w-xl mx-auto w-full my-4 bg-gray-200 rounded-2xl">
            <div className="flex gap-8 items-center p-8">
                <img alt="" src={avatarUrl(author?.avatarHash, 256)} className="rounded-full h-32 w-32" />
                <div className="flex flex-col">
                    <h2 className="text-5xl">{author?.name}</h2>
                    <span>{author?.bio.substring(0, 100)}</span>
                </div>
            </div>

            <div className="mx-4 p-6 bg-white rounded-2xl flex flex-col border-black border-2">
                <h1 className="text-3xl">{data?.title}</h1>
                <hr className="my-4" />
                <p className="text-lg">{data?.content}</p>
            </div>

            <div className="mx-4 my-8 p-6 bg-white rounded-xl">
                <p className="text-center">comments</p>
                {comments?.map(comment => (
                    <Comment
                        key={comment.id}
                        onEdit={handleEditComment}
                        onDelete={handleDeleteComment}
                        {...comment}
                    />
                ))}

                <CommentInput postId={data?.id} onPost={handleNewComment} />
            </div>
        </div>
    )
}
