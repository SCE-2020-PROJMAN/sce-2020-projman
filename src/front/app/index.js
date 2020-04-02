import React from 'react';
import {HashRouter, Route, Switch} from 'react-router-dom'; // Dev: use Router instead BrowserRouter
import mainRoute from './routes/main';

function App() {
    return (
        <React.Fragment>
            <HashRouter>
                <Switch>
                    <Route exact path="/" component={mainRoute}/>
                </Switch>
            </HashRouter>
        </React.Fragment>
    );
}

export default App;
