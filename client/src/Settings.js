import { NavLink, Switch, Route, Redirect } from "react-router-dom"

function Sidebar(props) {
    const items = props.items.map(
        item => <NavLink key={item} to={`/settings/${item}`} className="py-1 px-4" activeClassName="bg-green-300">{item}</NavLink>
    )

    return (
        <div className="flex flex-col m-4 w-48 rounded-xl border-2 divide-y overflow-hidden">
            {items}
        </div>
    )
}


function Input(props) {
    return (
        <label className="flex flex-col my-2">
            <span>{props.name}</span>
            <input className="rounded-md border-2 border-gray-200 focus:border-blue-500 outline-none px-3 py-2 my-2" type="text" name={props.name}/>
        </label>
    )
}


function SettingsPane(props) {
    return (
        <div className="w-96 my-4">
            <h1 className="text-2xl text-center">{props.title} settings</h1>
            <hr className="my-4" />
            {props.children}
        </div>
    )
}


function SubmitButton(props) {
    return (
        <input type="submit" value={props.text || "submit"} className="rounded-lg bg-green-300 disabled:bg-gray-200 hover:bg-green-500 transition-colors duration-300 p-4 my-2" />
    )
}


function ProfileSettings(props) {
    return (
        <SettingsPane title="profile">
            <form className="flex flex-col">
                <Input name="name" />
                <Input name="pronouns" />
                <Input name="url" />
                <Input name="location" />
                <label className="flex flex-col my-2">
                    bio
                    <textarea className="rounded-md border-2 border-gray-200 focus:border-blue-500 outline-none px-3 py-2 my-2" />
                </label>
                <SubmitButton text="save" />
            </form>
        </SettingsPane>
    )
}


function AccountSettings(props) {
    return (
        <SettingsPane title="account">
            <form className="flex flex-col">
                <Input name="email" />
                <SubmitButton text="change email" />
            </form>

            <form className="flex flex-col">
                <Input name="password" />
                <SubmitButton text="change password" />
            </form>
        </SettingsPane>
    )
}


export default function Settings(props) {
    return (
        <div className="mx-auto px-4 flex justify-center items-start gap-8">
            <Sidebar items={["profile", "account"]}/>
            <Switch>
                <Route path="/settings/profile" component={ProfileSettings} />
                <Route path="/settings/account" component={AccountSettings} />
                <Route path="/settings">
                    <Redirect to="/settings/profile" />
                </Route>
            </Switch>
        </div>
    )
}