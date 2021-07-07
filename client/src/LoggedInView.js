import { Switch, Route, Redirect } from "react-router-dom"

import Navbar from "./Navbar.js"
import Home from "./Home.js"
import Settings from "./Settings.js"

export default function LoggedInView() {
    return (
        <div>
            <Navbar />
            <Switch>
                <Route exact path="/" component={Home} />
                <Route path="/settings" component={Settings} />
                <Route path="/">
                    <Redirect to="/" />
                </Route>
            </Switch>
        </div>
    )
}