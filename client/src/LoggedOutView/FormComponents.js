export function Input(props) {
    return (
        <input size="1"
        className="rounded-full border-2 border-gray-200 focus:border-blue-500 outline-none px-6 py-4 my-2"
        {...props} {...props.field}
        />
    )
}


export function Button(props) {
    return (
        <input type="submit" size="1" {...props} className="rounded-full bg-green-300 disabled:bg-gray-200 hover:bg-green-500 transition-colors duration-300 p-4 my-2" />
    )
}