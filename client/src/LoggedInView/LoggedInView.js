import { Switch, Route, Redirect } from "react-router-dom"

import Navbar from "./Navbar.js"
import Home from "./Home.js"
import Settings from "./Settings.js"
import Messages from "./Messages.js"
import Inbox from "./Inbox.js"
import Profile from "./Profile/Profile.js"
import Compose from "./Compose.js"
import ShortUrl from "./Profile/ShortUrl"
import SocketProvider from "./SocketProvider.js"

export default function LoggedInView() {
    return (
        <SocketProvider>
            <div className="flex flex-col h-screen">
                <Navbar />
                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route path="/settings" component={Settings} />
                    <Route path="/messages" component={Messages} />
                    <Route path="/inbox" component={Inbox} />
                    <Route path="/compose/:id" component={Compose} />
                    <Route path="/compose" component={Compose} />
                    <Route path="/profile/:id" component={Profile} />
                    <Route path="/u/:shortcode" component={ShortUrl} />
                    <Route path="/">
                        <Redirect to="/" />
                    </Route>
                </Switch>
            </div>
        </SocketProvider>
    )
}
