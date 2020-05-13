import React from 'react';
import propTypes from 'prop-types';
import {Spinner, SpinnerSize, MessageBar, MessageBarType, DetailsList, FontIcon, SelectionMode, DetailsListLayoutMode} from 'office-ui-fabric-react';
import apiCall from '../apiCall';
import addressUtil from '../../../util/address';

class AdminRoute extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            error: false,
            orders: [],
        };
    }

    componentDidMount() {
        this.setState(prevState => ({
            ...prevState,
            loading: true,
            error: false,
        }));
        Promise.all([
            apiCall('get', 'auth/who-am-i')
                .then(res => {
                    if (!res.data.isAdmin) {
                        this.props.history.push('/login');
                    }
                }),
            apiCall('get', 'order/all')
                .then(res => {
                    this.setState(prevState => ({
                        ...prevState,
                        orders: res.data,
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

        function getCustomerStr(customer) {
            let str = customer.email;
            if (customer.isStudent) {
                str += ' (s)';
            }
            return str;
        }

        return (
            <React.Fragment>
                <DetailsList
                    compact={true}
                    selectionMode={SelectionMode.none}
                    layoutMode={DetailsListLayoutMode.justified}
                    isHeaderVisible={true}
                    items={this.state.orders.map(order => ({
                        ...order,
                        creationTime: (new Date(order.creationTime)).toLocaleDateString(),
                        shippingTime: (new Date(order.shippingTime)).toLocaleDateString(),
                        customer: getCustomerStr(order.customer),
                        address: addressUtil.getText(order.shippingAddress),
                        productCount: order.products.length,
                        key: order.creationTime + order.customer.email,
                    }))}
                    columns={[{
                        key: 'isLate',
                        name: 'Late?',
                        fieldName: 'isLate',
                        minWidth: 64,
                        maxWidth: 64,
                        onRender: item => <FontIcon iconName={item.isLate ? 'check' : 'times'} style={{color: item.isLate ? 'red' : 'green'}}/>,
                    }, {
                        key: 'isDone',
                        name: 'Delivered?',
                        iconName: 'truck',
                        fieldName: 'isDone',
                        isIconOnly: true,
                        minWidth: 64,
                        maxWidth: 64,
                        onRender: item => <FontIcon iconName={item.isDone ? 'check' : 'times'} style={{color: item.isDone ? 'green' : 'red'}}/>,
                    }, {
                        key: 'creationTime',
                        name: 'Creation Time',
                        fieldName: 'creationTime',
                        minWidth: 128,
                        maxWidth: 128,
                    }, {
                        key: 'shippingTime',
                        name: 'Shipping Time',
                        fieldName: 'shippingTime',
                        minWidth: 128,
                        maxWidth: 128,
                    }, {
                        key: 'productCount',
                        name: 'Product Count',
                        fieldName: 'productCount',
                        minWidth: 96,
                        maxWidth: 96,
                    }, {
                        key: 'revenue',
                        name: 'Revenue',
                        iconName: 'shekel',
                        fieldName: 'revenue',
                        minWidth: 96,
                        maxWidth: 96,
                    }, {
                        key: 'customer',
                        name: 'Customer',
                        iconName: 'user',
                        fieldName: 'customer',
                        minWidth: 256,
                    }, {
                        key: 'address',
                        name: 'Address',
                        fieldName: 'address',
                        minWidth: 256,
                    }]}
                />
            </React.Fragment>
        );
    }
}

AdminRoute.propTypes = {
    history: propTypes.any,
};

export default AdminRoute;
