import React from 'react';
import {HashRouter, Route, Switch} from 'react-router-dom'; // Dev: use Router instead BrowserRouter
import icons from './icons';
import mainRoute from './routes/main';
import adminRoute from './routes/admin';
import loginRoute from './routes/login';
import personalDetailsRoute from './routes/personalDetails';
import registerRoute from './routes/register';
import changePasswordRoute from './routes/changePassword';
import checkoutRoute from './routes/checkout';

icons.initialize();

function App() {
    function isLoggedIn() {
        return sessionStorage.getItem('authToken') && sessionStorage.getItem('authToken') !== '';
    }

    return (
        <HashRouter>
            <Switch>
                {isLoggedIn() ? (
                    <React.Fragment>
                        <Route exact path="/" component={mainRoute}/>
                        <Route path="/checkout" component={checkoutRoute}/>
                        <Route path="/admin" component={adminRoute}/>
                        <Route path="/personalDetails" component={personalDetailsRoute}/>
                    </React.Fragment>
                ) : (
                    <Route exact path="/" component={loginRoute}/>
                )}
                <Route path="/login" component={loginRoute}/>
                <Route path="/register" component={registerRoute}/>
                <Route path="/changePassword" component={changePasswordRoute}/>
            </Switch>
        </HashRouter>
    );
}

export default App;
