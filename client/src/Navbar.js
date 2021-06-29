import React from "react"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown } from "@fortawesome/free-solid-svg-icons"

import AuthContext from "./AuthContext.js"
import useAPI from "./api.js"


function ExpandedDropdown(props) {
    const Component = props.component

    return (
        <div className="absolute mt-2 -mr-2 right-0 z-10 w-60 py-4 px-6 bg-white text-black flex flex-col gap-2 rounded-xl shadow-xl cursor-auto">
            <Component doRetract={props.doRetract} />
        </div>
    )
}


function Dropdown(props) {
    const [expanded, setExpanded] = React.useState(false)

    const handleExpand = (e) => {
        setExpanded(!expanded)
    }

    const wrapperRef = React.useRef(null)

    React.useEffect(() => {
        const handleClick = (e) => {
            if (wrapperRef.current && expanded && !wrapperRef.current.contains(e.target)) {
                setExpanded(false)
            }
        }

        document.addEventListener("mousedown", handleClick)

        return () => {
            document.removeEventListener("mousedown", handleClick)
        }
    }, [wrapperRef, expanded])

    return (
        <div className="relative cursor-pointer" ref={wrapperRef}>
            <div onClick={handleExpand}>
                <span className="mx-4">{props.text}</span>
                <FontAwesomeIcon icon={faChevronDown}
                className={"transform transition-transform " + (expanded ? "rotate-180" : "rotate-0")} />
            </div>
            {expanded && <ExpandedDropdown component={props.component} doRetract={() => setExpanded(false)} />}
        </div>
    )
}

function UserDropdownMenu(props) {
    const [token, setToken] = React.useContext(AuthContext)

    const handleLogout = (e) => {
        props.doRetract()

        fetch("http://localhost:5000/auth/logout", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token.access_token}`
            }
        })

        setToken(null)
    }

    return (
        <>
            <Link to="/settings" onClick={props.doRetract}>settings</Link>
            <hr />
            <button className="text-left" onClick={handleLogout}>log out</button>
        </>
    )
}

export default function Navbar(props) {
    const { data: user } = useAPI("/auth/status")

    return (
        <div className="px-8 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white text-xl">
            <div className="container mx-auto px-4 flex">
                <Link to="/">flowspace</Link>
                <div className="flex-grow" />
                <Dropdown text={user?.name} component={UserDropdownMenu} />
            </div>
        </div>
    )
}