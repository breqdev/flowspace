import useAPI from "./api.js"

export default function LoggedInView() {
    const { data: user } = useAPI("/auth/status")

    return <div>Hello {user?.name}! You have a token :)</div>
}