import React from 'react';
import {Spinner, SpinnerSize, MessageBar, MessageBarType, DetailsList, SelectionMode, DetailsListLayoutMode, FontIcon, Stack, Checkbox, PrimaryButton} from 'office-ui-fabric-react';
import apiCall from '../../apiCall';

class Users extends React.Component {
    constructor(props) {
        super(props);

        this.updateUsers = this.updateUsers.bind(this);
        this.handleItemInvoked = this.handleItemInvoked.bind(this);
        this.handleEditUser = this.handleEditUser.bind(this);
        this.handleStoresChange = this.handleStoresChange.bind(this);
        this.handleSubmitUser = this.handleSubmitUser.bind(this);

        this.state = {
            loading: false,
            error: false,
            users: [],
            stores: [],
            selectedUser: null,
            editedUser: {
                isCustomer: null,
                isStudent: null,
                isAdmin: null,
                stores: {},
            },
            isSubmitting: false,
            submitError: false,
        };
    }

    componentDidMount() {
        this.setState(prevState => ({
            ...prevState,
            loading: true,
            error: false,
        }));
        Promise.all([
            this.updateUsers(),
            apiCall('get', 'store/all')
                .then(res => {
                    this.setState(prevState => ({
                        ...prevState,
                        stores: res.data.map(store => store.place),
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
                    loading: false,
                }));
            });
    }

    updateUsers() {
        return apiCall('get', 'user/all')
            .then(res => {
                this.setState(prevState => ({
                    ...prevState,
                    users: res.data,
                }));
            });
    }

    handleItemInvoked(item) {
        const user = this.state.users.find(user => user.email === item.email);
        if (user) {
            const userStores = {};
            this.state.stores.forEach(store => {
                userStores[store] = false;
            });
            ((user.admin && user.admin.storeAdmins) || []).forEach(storeAdmin => {
                userStores[storeAdmin.storePlace] = true;
            });
            this.setState(prevState => ({
                ...prevState,
                selectedUser: {
                    ...user,
                    isAdmin: item.isAdmin,
                    isCustomer: item.isCustomer,
                    isStudent: item.isStudent,
                },
                editedUser: {
                    ...prevState.editedUser,
                    stores: userStores,
                },
            }));
        }
    }

    handleEditUser(key) {
        return (e, val) => {
            this.setState(prevState => ({
                ...prevState,
                editedUser: {
                    ...prevState.editedUser,
                    [key]: val,
                },
            }));
        };
    }

    handleStoresChange(store) {
        return (e, val) => {
            console.log(val);
            this.setState(prevState => ({
                ...prevState,
                editedUser: {
                    ...prevState.editedUser,
                    stores: {
                        ...prevState.editedUser.stores,
                        [store]: val,
                    },
                },
            }));
        };
    }

    handleSubmitUser(e) {
        e.preventDefault();

        const data = {};
        const addData = key => (data[key] = (this.state.editedUser[key] === null ? this.state.selectedUser[key] : this.state.editedUser[key]) || false);
        addData('isCustomer');
        addData('isStudent');
        addData('isAdmin');
        data.adminStores = [];
        if (
            (this.state.editedUser.isAdmin !== null && this.state.editedUser.isAdmin) ||
            (this.state.editedUser.isAdmin === null && this.state.selectedUser.isAdmin)
        ) {
            data.adminStores = Object.keys(this.state.editedUser.stores).filter(store => this.state.editedUser.stores[store]);
        }

        this.setState(prevState => ({
            ...prevState,
            isSubmitting: true,
            submitError: false,
        }));
        apiCall('patch', `user/${this.state.selectedUser.email}/type`, data)
            .then(() => {
                this.setState(prevState => ({
                    ...prevState,
                    selectedUser: null,
                    editedUser: {
                        isCustomer: null,
                        isStudent: null,
                        isAdmin: null,
                        stores: {},
                    },
                }));
                this.updateUsers();
            })
            .catch(err => {
                console.error(err);
                this.setState(prevState => ({
                    ...prevState,
                    submitError: true,
                }));
            })
            .finally(() => {
                this.setState(prevState => ({
                    ...prevState,
                    isSubmitting: false,
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
            <React.Fragment>
                <DetailsList
                    compact={true}
                    selectionMode={SelectionMode.none}
                    layoutMode={DetailsListLayoutMode.justified}
                    isHeaderVisible={true}
                    onItemInvoked={this.handleItemInvoked}
                    items={this.state.users.map(user => ({
                        email: user.email,
                        isCustomer: user.customer !== null,
                        isStudent: user.customer && user.customer.isStudent,
                        isAdmin: user.admin !== null,
                        key: user.email,
                    }))}
                    columns={[{
                        key: 'email',
                        name: 'Email',
                        fieldName: 'email',
                        minWidth: 64,
                    }, {
                        key: 'isCustomer',
                        name: 'Customer',
                        fieldName: 'isCustomer',
                        minWidth: 64,
                        onRender: item => <FontIcon iconName={item.isCustomer ? 'check' : 'times'} style={{color: item.isCustomer ? 'green' : 'red'}}/>,
                    }, {
                        key: 'isStudent',
                        name: 'Student',
                        fieldName: 'isStudent',
                        minWidth: 64,
                        onRender: item => <FontIcon iconName={item.isStudent ? 'check' : 'times'} style={{color: item.isStudent ? 'green' : 'red'}}/>,
                    }, {
                        key: 'isAdmin',
                        name: 'Admin',
                        fieldName: 'isAdmin',
                        minWidth: 64,
                        onRender: item => <FontIcon iconName={item.isAdmin ? 'check' : 'times'} style={{color: item.isAdmin ? 'green' : 'red'}}/>,
                    }]}
                />

                {this.state.selectedUser && (
                    this.state.isSubmitting ? (
                        <Spinner size={SpinnerSize.large} label="Submitting . . ."/>
                    ) : (
                        <form onSubmit={this.handleSubmitUser}>
                            <h2>Editing user</h2>
                            <p>{this.state.selectedUser.email}</p>
                            <Stack vertical style={{maxWidth: '1000px', margin: 'auto'}}>
                                <Stack horizontal style={{justifyContent: 'space-evenly', margin: '1em'}}>
                                    <Checkbox
                                        label="Customer"
                                        checked={this.state.editedUser.isCustomer !== null ? this.state.editedUser.isCustomer : this.state.selectedUser.isCustomer}
                                        onChange={this.handleEditUser('isCustomer')}
                                    />
                                    {(this.state.editedUser.isCustomer !== null ? this.state.editedUser.isCustomer : this.state.selectedUser.isCustomer) &&
                                        <Checkbox
                                            label="Student"
                                            checked={this.state.editedUser.isStudent !== null ? this.state.editedUser.isStudent : this.state.selectedUser.isStudent}
                                            onChange={this.handleEditUser('isStudent')}
                                        />
                                    }
                                </Stack>
                                <Stack horizontal style={{justifyContent: 'space-evenly', margin: '1em'}}>
                                    <Checkbox
                                        label="Admin"
                                        checked={this.state.editedUser.isAdmin !== null ? this.state.editedUser.isAdmin : this.state.selectedUser.isAdmin}
                                        onChange={this.handleEditUser('isAdmin')}
                                    />
                                    {(this.state.editedUser.isAdmin !== null ? this.state.editedUser.isAdmin : this.state.selectedUser.isAdmin) &&
                                        this.state.stores.map(store => (
                                            <Checkbox
                                                key={store}
                                                label={`Admin of ${store}`}
                                                checked={this.state.editedUser.stores[store]}
                                                onChange={this.handleStoresChange(store)}
                                            />
                                        ))
                                    }
                                </Stack>
                                <PrimaryButton
                                    text="Save"
                                    iconProps={{iconName: 'save'}}
                                    type="submit"
                                    style={{marginTop: '1em'}}
                                    disabled={this.state.isSubmitting}
                                />
                                {this.state.submitError && (
                                    <MessageBar messageBarType={MessageBarType.error}>
                                        An error occurred. Try again later
                                    </MessageBar>
                                )}
                            </Stack>
                        </form>
                    )
                )}
            </React.Fragment>
        );
    }
}

export default Users;
