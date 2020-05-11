import React from 'react';
import propTypes from 'prop-types';
import { Button, Link, Label, TextField, PrimaryButton, MessageBar, MessageBarType } from 'office-ui-fabric-react';
import apiCall from '../apiCall';

class LoginRoute extends React.Component {
    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.toRegister = this.toRegister.bind(this);
        this.state = {
            email: '',
            password: '',
            error: false,
            success: false,
        };
    }

    handleSubmit(event) {
        event.preventDefault();
        this.setState(prevState => ({
            ...prevState,
            error: false,
            success: false,
            isSubmitting: true,
        }));
        apiCall('post', 'auth/login', {
            email: this.state.email,
            password: this.state.password,
        })
            .then(res => {
                sessionStorage.setItem('authToken', res.data.authToken);
                this.setState(prevState => ({
                    ...prevState,
                    success: true,
                }));
                setTimeout(() => {
                    this.props.history.push('/');
                }, 5000);
            })
            .catch(err => {
                if (err.response) {
                    if (err.response.data === 'expiry/password') {
                        this.props.history.push('/changePassword');
                    }
                    else {
                        this.setState(prevState => ({
                            ...prevState,
                            error: true,
                        }));
                    }
                }
            })
            .finally(() => {
                this.setState(prevState => ({
                    ...prevState,
                    isSubmitting: false,
                }));
            });
    }

    handleChange(key) {
        return (event, value) => {
            this.setState(prevState => ({
                ...prevState,
                [key]: value,
            }));
        };
    }
    toRegister(){
        this.props.history.push('/register');
    }
    render() {
        return (
            <div style={{marginLeft:'1 em'}}>
                <form onSubmit={this.handleSubmit} style={{ maxWidth: '1000px', margin: 'auto' }}>
                    <TextField
                        label="Email"
                        type="email"
                        value={this.state.email}
                        onChange={this.handleChange('email')}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        value={this.state.password}
                        onChange={this.handleChange('password')}
                    />
                    <PrimaryButton
                        text="Log in"
                        type="submit"
                        disabled={this.state.isSubmitting}
                    />
                    {this.state.success && (
                        <MessageBar messageBarType={MessageBarType.success}>
                            Log in successful. Redirecting you now . . .
                        </MessageBar>
                    )}
                    {this.state.error && (
                        <MessageBar messageBarType={MessageBarType.error}>
                            Could not log in. Does the password match the email? Are you registered?
                        </MessageBar>
                    )}
                </form>
                <Label style={{display:'inline'}}>Not registered? </Label><Button text="Click here" onClick={this.toRegister}/>
            </div>
        );
    }
}

LoginRoute.propTypes = {
    history: propTypes.any,
};

export default LoginRoute;
