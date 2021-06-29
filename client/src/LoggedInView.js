import { Switch, Route } from "react-router-dom"

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
            </Switch>
        </div>
    )
}