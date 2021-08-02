import { Redirect } from "react-router-dom"

import { decode } from "../../utils/bigintToBase64"

export default function ShortUrl(props) {
    const { shortcode } = props.match.params

    const userId = decode(shortcode)

    return <Redirect to={`/profile/${userId}`} />
}
