import React from 'react';
import propTypes from 'prop-types';
import { ActionButton, Link, Label, TextField, PrimaryButton, MessageBar, MessageBarType } from 'office-ui-fabric-react';
import apiCall from '../apiCall';

class RegisterRoute extends React.Component {
    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.toLogin = this.toLogin.bind(this);
        this.state = {
            email: '',
            password: '',
            error_email: false,
            error_password: false,
            success: false,
        };
    }

    handleSubmit(event) {
        event.preventDefault();
        this.setState(prevState => ({
            ...prevState,
            error_email: false,
            error_password: false,
            success: false,
            isSubmitting: true,
        }));
        apiCall('post', 'auth/register', {
            email: this.state.email,
            password: this.state.password,
        })
            .then(() => {
                this.setState(prevState => ({
                    ...prevState,
                    success: true,
                }));
                setTimeout(() => {
                    this.props.history.push('/login');
                }, 2000);
            })
            .catch(err => {
                if (err.response) {
                    if (err.response.data === 'validation/email') {
                        this.setState(prevState => ({
                            ...prevState,
                            error_email: true,
                        }));
                    }
                    if (err.response.data === 'validation/password') {
                        this.setState(prevState => ({
                            ...prevState,
                            error_password: true,
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
    toLogin() {
        this.props.history.push('/login');
    }
    render() {
        return (
            <form onSubmit={this.handleSubmit} style={{ maxWidth: '1000px', margin: 'auto', marginTop: '1em' }}>
                <TextField
                    label="Email"
                    type="email"
                    value={this.state.email}
                    onChange={this.handleChange('email')}
                />
                {this.state.error_email && (
                    <MessageBar messageBarType={MessageBarType.error}>
                        Invalid Email address
                    </MessageBar>
                )}
                <TextField
                    label="Password"
                    type="password"
                    value={this.state.password}
                    onChange={this.handleChange('password')}
                />
                {this.state.error_password && (
                    <MessageBar messageBarType={MessageBarType.error}>
                        At least 8 characters, should contain upper-case, lower-case and a digit.
                    </MessageBar>
                )}
                <PrimaryButton
                    text="Register"
                    type="submit"
                    style={{ marginTop: '1em' }}
                    disabled={this.state.isSubmitting}
                />
                {this.state.success && (
                    <MessageBar messageBarType={MessageBarType.success}>
                        Registered successfully. Redirecting you now . . .
                    </MessageBar>
                )}
                <Label style={{ display: 'inline' }}>Already registered? </Label><ActionButton text="Click here" onClick={this.toLogin} />
            </form>

        );
    }
}

RegisterRoute.propTypes = {
    history: propTypes.any,
};

export default RegisterRoute;
