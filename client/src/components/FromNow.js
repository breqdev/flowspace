import dayjs from "dayjs"
import { useEffect, useState } from "react"


export default function FromNow(props) {
    const date = dayjs(props.date)
    const [time, setTime] = useState(date.fromNow())

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(date.fromNow())
        }, 1000)
        return () => clearInterval(timer)
    }, [date])

    return (
        <span>{time}</span>
    )
}

