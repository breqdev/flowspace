import React from "react"
import { Link, Redirect } from "react-router-dom"


import { useAPI } from "../../api.js"
import { ImageModule, MarkdownModule, ModuleGrid, VideoModule } from "./Module.js"


import UserCard from "./UserCard.js"


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

    const markdownContent = `This is example markdown content

And so is this
... on the same paragraph


And a different paragraph


* This is a list
* This is another list item

Links are cool [hi](https://google.com)


tables?

| col | col | col |
|-----|-----|-----|
| row | row | row |

`

    return (
        <div className="max-w-6xl mx-auto w-full">
            <UserCard user={data} />

            <ModuleGrid>
                <MarkdownModule content={markdownContent} />
                <ImageModule src="https://cdn.pixabay.com/photo/2013/07/12/17/47/test-pattern-152459_960_720.png" caption="Test Image" url="https://google.com" />
                <VideoModule />
            </ModuleGrid>
        </div>
    )
}