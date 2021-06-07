import { Route, Switch, useRouteMatch } from "react-router";
import Messenger from "./messenger.jsx"

export default function JamiMessenger(props) {
    const { path, url } = useRouteMatch();

    console.log("JamiMessenger render")

    return <Switch>
        <Route path={`${path}/addContact/:contactId`} component={Messenger} />
        <Route path={`${path}/conversation/:conversationId`} component={Messenger} />
        <Route path={`${path}`} component={Messenger} />
    </Switch>
}