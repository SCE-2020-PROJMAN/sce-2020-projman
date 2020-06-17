import React from 'react';
import propTypes from 'prop-types';
import { TextField, PrimaryButton, MessageBar, MessageBarType } from 'office-ui-fabric-react';
import apiCall from '../apiCall';

class ChangePasswordRoute extends React.Component {
    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);

        this.state = {
            email: '',
            old_password: '',
            new_password: '',
            error_email: false,
            error_old_password: false,
            error_new_password: false,
            error_passwords_equal: false,
            success: false,
        };
    }
    handleSubmit(event) {
        event.preventDefault();
        this.setState(prevState => ({
            ...prevState,
            error_email: false,
            error_old_password: false,
            error_new_password: false,
            error_passwords_equal: false,
            success: false,
            isSubmitting: true,
        }));
        apiCall('post', 'auth/change-password', {
            email: this.state.email,
            oldPassword: this.state.old_password,
            newPassword: this.state.new_password,
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
                    switch(err.response.data) {
                        case 'validation/email':
                            this.setState(prevState => ({
                                ...prevState,
                                error_email: true,
                            }));
                            break;
                        case 'validation/oldPassword':
                            this.setState(prevState => ({
                                ...prevState,
                                error_old_password: true,
                            }));
                            break;
                        case 'validation/newPassword':
                            this.setState(prevState => ({
                                ...prevState,
                                error_new_password: true,
                            }));
                            break;
                        case 'validation/passwordsEqual':
                            this.setState(prevState => ({
                                ...prevState,
                                error_passwords_equal: true,
                            }));
                            break;
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
                    label="Old Password"
                    type="password"
                    value={this.state.old_password}
                    onChange={this.handleChange('old_password')}
                />
                {this.state.error_old_password && (
                    <MessageBar messageBarType={MessageBarType.error}>
                        Wrong password
                    </MessageBar>
                )}
                <TextField
                    label="New Password"
                    type="password"
                    value={this.state.new_password}
                    onChange={this.handleChange('new_password')}
                />
                {this.state.error_new_password && (
                    <MessageBar messageBarType={MessageBarType.error}>
                        At least 8 characters, should contain upper-case, lower-case and a digit.
                    </MessageBar>
                )}
                {this.state.error_passwords_equal && (
                    <MessageBar messageBarType={MessageBarType.error}>
                        New password can`t be identical to old password.
                    </MessageBar>
                )}
                <PrimaryButton
                    text="Change"
                    type="submit"
                    style={{ marginTop: '1em' }}
                    disabled={this.state.isSubmitting}
                />
                {this.state.success && (
                    <MessageBar messageBarType={MessageBarType.success}>
                        Password changed successfully. Redirecting you now . . .
                    </MessageBar>
                )}

            </form>
        );
    }
}

ChangePasswordRoute.propTypes = {
    history: propTypes.any,
};

export default ChangePasswordRoute;
