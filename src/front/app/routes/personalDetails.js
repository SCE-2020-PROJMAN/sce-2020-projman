import React from 'react';
import {Spinner, SpinnerSize, MessageBar, MessageBarType, Stack, TextField, ActionButton, IconButton, PrimaryButton} from 'office-ui-fabric-react';
import apiCall from '../apiCall';

class PersonalDetails extends React.Component {
    constructor(props) {
        super(props);

        this.handleAddAddress = this.handleAddAddress.bind(this);
        this.handleEditAddress = this.handleEditAddress.bind(this);
        this.handleDeleteAddress = this.handleDeleteAddress.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = {
            loading: false,
            error: false,
            addresses: [],
        };
    }

    componentDidMount() {
        this.setState(prevState => ({
            ...prevState,
            loading: true,
            error: false,
        }));
        apiCall('get', 'customer/address')
            .then(res => {
                this.setState(prevState => ({
                    ...prevState,
                    addresses: res.data,
                }));
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
                    loading: false,
                }));
            });
    }

    handleAddAddress() {
        this.setState(prevState => ({
            ...prevState,
            addresses: [{
                city: '',
                street: '',
                house: '',
                apartment: '',
            }, ...prevState.addresses],
        }));
    }

    handleEditAddress(index, key) {
        return (e, val) => {
            this.setState(prevState => ({
                ...prevState,
                addresses: [
                    ...prevState.addresses.slice(0, index),
                    {
                        ...prevState.addresses[index],
                        [key]: val,
                    },
                    ...prevState.addresses.slice(index + 1),
                ],
            }));
        };
    }

    handleDeleteAddress(index) {
        return () => {
            this.setState(prevState => ({
                ...prevState,
                addresses: [
                    ...prevState.addresses.slice(0, index),
                    ...prevState.addresses.slice(index + 1),
                ],
            }));
        };
    }

    handleSubmit(e) {
        e.preventDefault();

        this.setState(prevState => ({
            ...prevState,
            submitting: true,
        }));
        apiCall('post', 'customer/address', {addresses: this.state.addresses})
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

    render() {
        if (this.state.loading) {
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
            <form onSubmit={this.handleSubmit}>
                <h1>Addresses</h1>
                <ActionButton
                    iconProps={{iconName: 'plus'}}
                    onClick={this.handleAddAddress}
                    disabled={this.state.submitting}
                >
                    Add Address
                </ActionButton>
                {this.state.addresses.map((address, index) => (
                    <Stack horizontal key={index} style={{alignItems: 'flex-end'}}>
                        <Stack.Item>
                            <Stack horizontal>
                                <TextField
                                    label="City"
                                    value={address.city}
                                    onChange={this.handleEditAddress(index, 'city')}
                                    disabled={this.state.submitting}
                                />
                                <TextField
                                    label="Street"
                                    value={address.street}
                                    onChange={this.handleEditAddress(index, 'street')}
                                    disabled={this.state.submitting}
                                />
                                <TextField
                                    label="House"
                                    value={address.house}
                                    onChange={this.handleEditAddress(index, 'house')}
                                    disabled={this.state.submitting}
                                />
                                <TextField
                                    label="Apartment"
                                    value={address.apartment}
                                    onChange={this.handleEditAddress(index, 'apartment')}
                                    disabled={this.state.submitting}
                                />
                            </Stack>
                        </Stack.Item>
                        <IconButton
                            iconProps={{iconName: 'cancel'}}
                            onClick={this.handleDeleteAddress(index)}
                            style={{color: 'red'}}
                            disabled={this.state.submitting}
                        />
                    </Stack>
                ))}
                <PrimaryButton
                    text="Save"
                    type="submit"
                    disabled={this.state.submitting}
                />
            </form>
        );
    }
}

export default PersonalDetails;
