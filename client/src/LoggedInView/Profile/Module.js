import React from "react"


export function ModuleGrid(props) {
    return (
        <div>
            {props.children}
        </div>
    )
}


export function Module(props) {
    return (
        <div>
            {props.children}
        </div>
    )
}


export function MarkdownModule(props) {
    return (
        <Module dangerouslySetInnerHTML={{ __html: props.content}} />
    )
}


export function ImageModule(props) {
    return (
        <Module>
            <img src={props.src} alt={props.alt} />
        </Module>
    )
}


export function VideoModule(props) {
    return (
        <Module>
            <iframe id="player" type="text/html" src={"https://www.youtube.com/embed/" + props.id} frameborder="0" allowfullscreen />
        </Module>
    )
}

