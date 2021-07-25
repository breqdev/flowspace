import React from "react"
import ReactMarkdown from "react-markdown"
import gfm from "remark-gfm"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons"

import styles from "./Markdown.module.css"


export function ModuleGrid(props) {
    return (
        <div className="grid grid-cols-2 md:m-16 gap-16">
            {props.children}
        </div>
    )
}


export function Module(props) {
    return (
        <div className="aspect-w-1 aspect-h-1">
            <div className={"border-2 border-black rounded-3xl overflow-hidden " + (props.className || "")}>
                {props.children}
            </div>
        </div>
    )
}


export function MarkdownModule(props) {
    return (
        <Module className="text-lg">
            <div className="m-8">
                <ReactMarkdown className={styles.markdown} remarkPlugins={[gfm]} children={props.content} />
            </div>
        </Module>
    )
}


export function ImageModule(props) {
    let caption

    if (props.url) {
        caption = (
            <a className="text-center text-xl m-3" href={props.url}>
                {props.caption}
                <FontAwesomeIcon className="mx-3" icon={faExternalLinkAlt} />
            </a>
        )
    } else {
        caption = (
            <span className="text-center text-xl m-3" href={props.url}>
                {props.caption}
            </span>
        )
    }


    return (
        <Module className="flex flex-col">
            <img className="w-full h-full object-cover" src={props.src} alt={props.alt} />
            {caption}
        </Module>
    )
}


export function VideoModule(props) {
    const id = "dQw4w9WgXcQ"

    return (
        <Module>
            <iframe className="w-full h-full" title="YouTube Video" id="player" type="text/html" src={"https://www.youtube.com/embed/" + id} frameBorder="0" allowFullScreen />
        </Module>
    )
}

