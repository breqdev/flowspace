import { Switch, Route, Redirect } from "react-router-dom"

import Navbar from "./Navbar.js"
import Home from "./Home.js"
import Settings from "./Settings.js"
import Profile from "./Profile/Profile.js"
import ShortUrl from "./Profile/ShortUrl"

export default function LoggedInView() {
    return (
        <div className="flex flex-col h-screen">
            <Navbar />
            <Switch>
                <Route exact path="/" component={Home} />
                <Route path="/settings" component={Settings} />
                <Route path="/profile/:id" component={Profile} />
                <Route path="/u/:shortcode" component={ShortUrl} />
                <Route path="/">
                    <Redirect to="/" />
                </Route>
            </Switch>
        </div>
    )
}
