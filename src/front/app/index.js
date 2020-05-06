import React from 'react';
import {HashRouter, Route, Switch} from 'react-router-dom'; // Dev: use Router instead BrowserRouter
import mainRoute from './routes/main';
import loginRoute from './routes/login';

function App() {
    return (
        <React.Fragment>
            <HashRouter>
                <Switch>
                    <Route exact path="/" component={mainRoute}/>
                    <Route path="/login" component={loginRoute}/>
                </Switch>
            </HashRouter>
        </React.Fragment>
    );
}

export default App;
