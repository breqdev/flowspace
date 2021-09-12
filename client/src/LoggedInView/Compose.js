import { Field, Form, Formik } from "formik"
import React from "react"
import { useHistory } from "react-router"
import AuthContext from "../context/AuthContext"
import { fetchWithToken, useAPI, useUserId } from "../utils/api"


export default function Compose(props) {
    const { id } = props.match.params

    const [token, setToken] = React.useContext(AuthContext)

    const history = useHistory()

    const userId = useUserId()

    const { data: existing } = useAPI(`/posts/:0`, [id])

    const initialValues = {
        title: existing?.title ?? "",
        content: existing?.content ?? "",
        isPrivate: existing?.isPrivate ?? false
    }

    return (
        <Formik
            initialValues={initialValues}
            enableReinitialize={true}
            onSubmit={async (values) => {
                let response

                if (id) {
                    // Update the existing post
                    response = await fetchWithToken(`/posts/${id}`, token, setToken, {
                        method: "PATCH",
                        body: values,
                    })
                } else {
                    // Create a new post
                    response = await fetchWithToken("/posts", token, setToken, {
                        method: "POST",
                        body: values,
                    })
                }

                if (response.ok) {
                    history.push(`/profile/${userId}`)
                }
            }}
        >
            {formik => (
                <Form className="max-w-2xl mx-auto my-4 px-2 flex flex-col gap-4 w-full text-lg">
                    <h1 className="text-center text-3xl">compose a new post</h1>
                    <Field type="text" name="title" placeholder="title" className="rounded-md border-2 border-gray-200 focus:border-blue-500 outline-none py-2 px-3" />
                    <Field as="textarea" name="content" className="rounded-md border-2 border-gray-200 focus:border-blue-500 outline-none py-2 px-3 h-60" />

                    <div className="flex flex-row flex-wrap gap-4 items-center">
                        <div className="text-gray-700">
                            <label>
                                make this post private
                                <Field type="checkbox" name="isPrivate" className="ml-2" />
                            </label>
                        </div>
                        <div className="flex-grow text-right">
                            <button type="submit" className="rounded-lg bg-green-300 disabled:bg-gray-200 hover:bg-green-500 transition-colors duration-300 px-8 py-4 ">
                                publish
                            </button>
                        </div>
                    </div>
                </Form>
            )}
        </Formik>
    )
}