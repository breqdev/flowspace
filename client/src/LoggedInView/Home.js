import React from "react"


function BlinkingCursor(props) {
    const cursor = React.useRef(null)

    React.useEffect(() => {
        const interval = setInterval(() => {
            const color = cursor.current.style.color
            cursor.current.style.color = (
                color === "rgb(0, 0, 0)"
                ? "rgb(255, 255, 255)"
                : "rgb(0, 0, 0)"
            )
        }, 500)
        return () => clearInterval(interval)
    }, [])

    return (
        <span ref={cursor}>_</span>
    )
}

function Placeholder(props) {
    return (
        <div className="my-16 px-8 py-8 bg-black text-white">
            <code className="text-xl">
                you are currently at the flowspace homepage.
                <br />
                there is nothing here.
                <br />
                brooke is hard at work right now building this.
                <br />
                pardon the dust.
                <br />
                in the meantime, send brooke your thoughts.
                <br />
                comments, complaints, feedback, whatever.
                <br />
                she'd love to hear from you.
                <br />
                &gt; <BlinkingCursor />
            </code>
        </div>
    )
}


export default function Home(props) {
    return (
        <div className="px-4 flex justify-center">
            <div className="max-w-4xl w-full">
                <h1 className="text-6xl md:text-9xl text-center my-8">flowspace</h1>
                <Placeholder />
            </div>
        </div>
    )
}