import React from "react"
import { Link, Redirect } from "react-router-dom"
import { useAPI } from "../../utils/api.js"
import UserCard from "./UserCard.js"
import Post from "../../components/Post"

function Feed(props) {
    return (
        <div className="max-w-xl mx-auto p-4 flex flex-col gap-8">
            {props.posts?.map(post => <Post key={post.id} onMutate={props.onMutate} {...post} />)}
        </div>
    )
}


export default function Profile(props) {
    const { id } = props.match.params

    const { data: status } = useAPI("/auth/status")
    const { data } = useAPI("/profile/:0", [id === "@me" ? null : id])
    const { data: posts, mutate } = useAPI("/posts/user/:0", [id === "@me" ? null : id])

    if (id === "@me" && status) {
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
            <Feed posts={posts} onMutate={mutate} />
        </div>
    )
}