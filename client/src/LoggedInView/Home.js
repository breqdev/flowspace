import React from "react"

import Post from "../components/Post"
import { useAPI } from "../utils/api"

function NoPostsYet() {
    return (
        <div className="text-center">
            <h3 className="text-xl">no posts yet</h3>
            <p>follow some people to have their posts appear in your feed.</p>
        </div>
    )
}


export default function Home(props) {

    const { data: posts } = useAPI("/feed")

    return (
        <div className="px-4 flex max-w-4xl w-full h-full flex-col mx-auto">
            <h1 className="text-6xl md:text-9xl text-center my-8">flowspace</h1>

            <div className="max-w-xl w-full mx-auto p-4 flex flex-col gap-8">
                {posts?.length > 0
                    ? posts?.map(post => <Post key={post.id} {...post} />)
                    : <NoPostsYet />}
            </div>
        </div>
    )
}