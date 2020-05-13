import React from 'react';
import {HashRouter, Route, Switch} from 'react-router-dom'; // Dev: use Router instead BrowserRouter
import icons from './icons';
import mainRoute from './routes/main';
import loginRoute from './routes/login';
import registerRoute from './routes/register';
import changePasswordRoute from './routes/changePassword';
import checkoutRoute from './routes/checkout';

icons.initialize();

function App() {
    function isLoggedIn() {
        return sessionStorage.getItem('authToken') && sessionStorage.getItem('authToken') !== '';
    }

    return (
        <React.Fragment>
            <HashRouter>
                <Switch>
                    {isLoggedIn() ? (
                        <React.Fragment>
                            <Route exact path="/" component={mainRoute}/>
                            <Route path="/checkout" component={checkoutRoute}/>
                        </React.Fragment>
                    ) : (
                        <Route exact path="/" component={loginRoute}/>
                    )}
                    <Route path="/login" component={loginRoute}/>
                    <Route path="/register" component={registerRoute}/>
                    <Route path="/changePassword" component={changePasswordRoute}/>
                </Switch>
            </HashRouter>
        </React.Fragment>
    );
}

export default App;
