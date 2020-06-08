import React from 'react';
import propTypes from 'prop-types';
import {Spinner, SpinnerSize, MessageBar, MessageBarType, TextField, Stack, PrimaryButton, ComboBox} from 'office-ui-fabric-react';
import bankAccountValidator from 'il-bank-account-validator';
import moment from 'moment';
import apiCall from '../apiCall';
import ShoppingCart from '../components/shoppingCart';
import addressUtil from '../../../util/address';

function downloadFile(name, data, type = 'text/plain') {
    const tempElement = document.createElement('a');
    tempElement.download = name;
    const blob = new Blob([data], {type: type});
    tempElement.href = window.URL.createObjectURL(blob);
    document.body.appendChild(tempElement);
    tempElement.click();
    document.body.removeChild(tempElement);
}

class CheckoutRoute extends React.Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.setAddress = this.setAddress.bind(this);

        this.state = {
            isLoading: false,
            isStudent: false,
            addresses: [],
            addressId: null,
            bank: '',
            branch: '',
            account: '',
            submitting: false,
            success: false,
            error: false,
            validationError: false,
        };
    }

    componentDidMount() {
        this.setState(prevState => ({
            ...prevState,
            isLoading: true,
            error: false,
        }));
        Promise.all([
            apiCall('get', 'auth/who-am-i')
                .then(res => {
                    this.setState(prevState => ({
                        ...prevState,
                        isAdmin: res.data.isAdmin,
                        isCustomer: res.data.isCustomer,
                        isStudent: res.data.isStudent,
                    }));
                }),
            apiCall('get', 'customer/address')
                .then(res => {
                    this.setState(prevState => ({
                        ...prevState,
                        addresses: res.data,
                    }));
                }),
        ])
            .catch(err => {
                console.error(err);
                this.setState(prevState => ({
                    ...prevState,
                    error: true,
                }));
            })
            .finally(() => {
                this.setState(prevState => ({
                    ...prevState,
                    isLoading: false,
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

    handleSubmit(e) {
        e.preventDefault();
        if (bankAccountValidator(this.state.bank, this.state.branch, this.state.account)) {
            this.setState(prevState => ({
                ...prevState,
                validationError: false,
            }));
        } else {
            this.setState(prevState => ({
                ...prevState,
                validationError: true,
            }));
            return;
        }

        this.setState(prevState => ({
            ...prevState,
            submitting: true,
        }));
        apiCall('post', 'order', {
            shippingTime: moment().add(7, 'day').toDate(),
            addressId: this.state.addressId,
        })
            .then(orderCreationResponse => {
                this.setState(prevState => ({
                    ...prevState,
                    success: true,
                }));
                apiCall('get', 'order/receipt', {
                    orderId: orderCreationResponse.data.id,
                    orderCreationTime: orderCreationResponse.data.creationTime,
                }, {
                    responseType: 'blob',
                })
                    .then(receiptResponse => {
                        downloadFile('receipt.pdf', receiptResponse.data, 'application/pdf');
                    })
                    .finally(() => {
                        setTimeout(() => {
                            this.props.history.push('/');
                        }, 1000);
                    });
            })
            .catch(err => {
                console.error(err);
                this.setState(prevState => ({
                    ...prevState,
                    error: true,
                }));
            })
            .finally(() => {
                this.setState(prevState => ({
                    ...prevState,
                    submitting: false,
                }));
            });
    }

    setAddress(e, option) {
        this.setState(prevState => ({
            ...prevState,
            addressId: option.key,
        }));
    }
    
    render() {
        if (this.state.isLoading) {
            return <Spinner
                label="Loading . . ."
                size={SpinnerSize.large}
            />;
        }

        if (this.state.error) {
            return <MessageBar messageBarType={MessageBarType.error}>
                There was an error. Try agian later
            </MessageBar>;
        }

        return (
            <div style={{maxWidth: '1000px', margin: 'auto'}}>
                <h1>Order details:</h1>
                <div style={{backgroundColor: '#fff'}}>
                    <ShoppingCart
                        isStudent={this.state.isStudent}
                    />
                </div>
                <form onSubmit={this.handleSubmit}>
                    <h1>Which address to ship to?</h1>
                    <ComboBox
                        label="Address"
                        options={this.state.addresses.map(address => ({
                            key: address.id,
                            text: addressUtil.getText(address),
                        }))}
                        selectedKey={this.state.addressId}
                        onChange={this.setAddress}
                    />

                    <h1>How will you pay?</h1>
                    <Stack horizontal>
                        <Stack.Item grow={1}>
                            <TextField
                                label="Bank"
                                value={this.state.bank}
                                onChange={this.handleChange('bank')}
                            />
                        </Stack.Item>
                        <Stack.Item grow={1}>
                            <TextField
                                label="Branch"
                                value={this.state.branch}
                                onChange={this.handleChange('branch')}
                            />
                        </Stack.Item>
                        <Stack.Item grow={1}>
                            <TextField
                                label="Account"
                                value={this.state.account}
                                onChange={this.handleChange('account')}
                            />
                        </Stack.Item>
                    </Stack>
                    {this.state.validationError && (
                        <MessageBar messageBarType={MessageBarType.error}>
                            There is an error with the payment method details. Please check them.
                        </MessageBar>
                    )}
                    {this.state.success && (
                        <MessageBar messageBarType={MessageBarType.success}>
                            Success! Redirecting you now . . .
                        </MessageBar>
                    )}
                    <PrimaryButton
                        text="Submit"
                        type="submit"
                        disabled={this.state.submitting}
                    />
                </form>
            </div>
        );
    }
}

CheckoutRoute.propTypes = {
    history: propTypes.any,
};

export default CheckoutRoute;
