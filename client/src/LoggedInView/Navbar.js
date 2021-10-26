import React from "react"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown, faHome, faInbox, faPaperPlane, faPlus } from "@fortawesome/free-solid-svg-icons"
import { mutate } from "swr"

import AuthContext from "../context/AuthContext.js"
import { useAPI, avatarUrl } from "../utils/api.js"


function ExpandedDropdown(props) {
    const Component = props.component

    return (
        <div className="absolute mt-2 -mr-2 right-0 z-10 w-60 py-4 px-6 bg-white text-black flex flex-col gap-2 rounded-xl shadow-2xl cursor-auto">
            <Component doRetract={props.doRetract} />
        </div>
    )
}


function ExpandButton(props) {
    const className = "m-2 transform transition-transform " + (props.expanded ? "rotate-180" : "rotate-0")

    return (
        <FontAwesomeIcon icon={faChevronDown} className={className} />
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
        <div className="flex-shrink min-w-0 relative cursor-pointer select-none" ref={wrapperRef}>
            <div className="flex items-center border-white border rounded-full" onClick={handleExpand}>
                {props.children}
                <ExpandButton expanded={expanded} />
            </div>
            {expanded && <ExpandedDropdown component={props.component} doRetract={() => setExpanded(false)} />}
        </div>
    )
}


function UserDropdownMenu(props) {
    const [, setToken] = React.useContext(AuthContext)

    const { data: user } = useAPI("/profile/@me")

    const handleLogout = (e) => {
        props.doRetract()
        mutate("/auth/status")
        mutate("/profile/@me")
        setToken(null)
    }

    return (
        <>
            <span className="text-base text-gray-600 -mb-2">
                hi, <span className="text-blue-500">{user?.name}</span>
            </span>
            <hr />
            <Link to={`/profile/${user?.id}`} onClick={props.doRetract}>my profile</Link>
            <hr />
            <Link to="/settings" onClick={props.doRetract}>settings</Link>
            <hr />
            <button className="text-left" onClick={handleLogout}>log out</button>
        </>
    )
}


function NavbarIcons(props) {
    const { data: user } = useAPI("/profile/@me")
    const { data: inbox } = useAPI("/relationship/inbox")

    return (
        <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-3 md:text-2xl md:gap-4">
                <Link to="/" className="hidden sm:block">
                    <FontAwesomeIcon icon={faHome} />
                    <span className="sr-only">home</span>
                </Link>

                <Link to="/messages">
                    <FontAwesomeIcon icon={faPaperPlane} />
                    <span className="sr-only">messages</span>
                </Link>

                <Link to="/inbox" className="relative">
                    <FontAwesomeIcon icon={faInbox} />
                    <span className="sr-only">inbox</span>
                    {inbox?.length > 0 && <span className="absolute top-0 right-0 -mr-1 -mt-1 bg-red-500 text-white text-xs px-1 rounded-full">{inbox?.length}</span>}
                </Link>

                <Link to="/compose">
                    <FontAwesomeIcon icon={faPlus} />
                    <span className="sr-only">compose</span>
                </Link>
            </div>

            <Dropdown text={user?.name} component={UserDropdownMenu}>
                <img className="rounded-full w-8" alt="user profile" src={avatarUrl(user?.avatarHash, 64)} />
                <span className="sr-only">user menu</span>
            </Dropdown>
        </div>
    )

}


export default function Navbar(props) {
    return (
        <div className="px-4 md:px-8 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white text-xl">
            <div className="max-w-4xl mx-auto px-4 flex">
                <Link to="/" className="text-2xl">flowspace</Link>
                <div className="flex-grow" />
                <NavbarIcons />
            </div>
        </div>
    )
}