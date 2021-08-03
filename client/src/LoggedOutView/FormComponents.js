export function Input(props) {
    const error = props.form.touched[props.field.name] && props.form.errors[props.field.name]

    return (
        <div className="relative">
            <input size="1"
            className={
                "w-full px-6 py-4 my-2 rounded-full border-2 " +
                "focus:border-blue-500 outline-none " +
                (error ? "border-red-400" : "border-gray-200")
            }
            {...props} {...props.field}
            />
            <div className="absolute bottom-0 left-0 right-0 -mb-1 text-lg text-red-600"
            style={{ display: error ? 'block' : 'none'}}>
                <span className="rounded-full border-2 border-red-400 px-4 bg-white">
                    {error}
                </span>
            </div>
        </div>
    )
}


export function Button(props) {
    return (
        <input type="submit" size="1" {...props} className="rounded-full bg-green-300 disabled:bg-gray-200 hover:bg-green-500 transition-colors duration-300 p-4 my-2" />
    )
}