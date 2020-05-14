import React from 'react';
import propTypes from 'prop-types';
import {Spinner, SpinnerSize, MessageBar, MessageBarType, DetailsList, FontIcon, SelectionMode, DetailsListLayoutMode, ActionButton, Pivot, PivotItem} from 'office-ui-fabric-react';
import {HorizontalBar} from 'react-chartjs-2';
import apiCall from '../apiCall';
import addressUtil from '../../../util/address';
import util from '../util';

class AdminRoute extends React.Component {
    constructor(props) {
        super(props);

        this.deliverOrder = this.deliverOrder.bind(this);

        this.state = {
            loading: false,
            error: false,
            editingOrder: false,
            orders: [],
            analytics: {
                revenue: {
                    total: 0,
                    perCategory: {},
                    perDayOfWeek: {},
                },
            },
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
            apiCall('get', 'order/analytics')
                .then(res => {
                    this.setState(prevState => ({
                        ...prevState,
                        analytics: res.data,
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

    deliverOrder(order) {
        return () => {
            this.setState(prevState => ({
                ...prevState,
                editingOrder: true,
            }));
            apiCall('patch', 'order', {
                orderCreationTime: order.creationTime,
                orderCustomerEmail: order.customer.email,
                isDone: true,
            })
                .then(() => {
                    this.setState(prevState => {
                        const index = prevState.orders.findIndex(order2 => ((order.creationTime === order2.creationTime) && (order.customer.email === order2.customer.email)));
                        if (index === -1) {
                            return prevState;
                        }
                        return {
                            ...prevState,
                            orders: [
                                ...prevState.orders.slice(0, index),
                                { ...prevState.orders[index], isDone: true, isLate: false },
                                ...prevState.orders.slice(index + 1),
                            ],
                        };
                    });
                })
                .catch(err => {
                    console.error(err);
                })
                .finally(() => {
                    this.setState(prevState => ({
                        ...prevState,
                        editingOrder: false,
                    }));
                });
        };
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
            if (!customer) {
                return '';
            }
            let str = customer.email;
            if (customer.isStudent) {
                str += ' (s)';
            }
            return str;
        }

        return (
            <React.Fragment>
                <h1>Admin</h1>

                <Pivot>
                    <PivotItem headerText="Orders">
                        <DetailsList
                            compact={true}
                            selectionMode={SelectionMode.none}
                            layoutMode={DetailsListLayoutMode.justified}
                            isHeaderVisible={true}
                            items={this.state.orders.map(order => ({
                                ...order,
                                creationTimeStr: (new Date(order.creationTime)).toLocaleDateString(),
                                shippingTimeStr: (new Date(order.shippingTime)).toLocaleDateString(),
                                customerEmail: getCustomerStr(order.customer),
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
                                fieldName: 'creationTimeStr',
                                minWidth: 128,
                                maxWidth: 128,
                            }, {
                                key: 'shippingTime',
                                name: 'Shipping Time',
                                fieldName: 'shippingTimeStr',
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
                                fieldName: 'customerEmail',
                                minWidth: 256,
                            }, {
                                key: 'address',
                                name: 'Address',
                                fieldName: 'address',
                                minWidth: 256,
                            }, {
                                key: 'complete',
                                name: '',
                                onRender: order => (
                                    order.isDone ? (
                                        <React.Fragment></React.Fragment>
                                    ) : (
                                        <ActionButton iconProps={{iconName: 'truck'}} onClick={this.deliverOrder(order)} disabled={this.state.editingOrder}>Deliver</ActionButton>
                                    )
                                ),
                            }]}
                        />
                    </PivotItem>
                    <PivotItem headerText="Analytics">
                        <p>Total revenue: {this.state.analytics.revenue.total}</p>
                        {Object.keys(this.state.analytics.revenue.perCategory || {}).map(categoryName =>
                            <p key={categoryName}>
                                Revenue ({categoryName} category): {this.state.analytics.revenue.perCategory[categoryName]}
                            </p>
                        )}
                        <HorizontalBar
                            data={{
                                labels: Object.keys(this.state.analytics.revenue.perDayOfWeek || {}).map(day => util.capitalize(day)),
                                datasets: [{
                                    label: 'Revenue',
                                    backgroundColor: '#2e9636',
                                    data: Object.values(this.state.analytics.revenue.perDayOfWeek || {}),
                                }],
                            }}
                            options={{
                                legend: {display: false},
                            }}
                        />
                    </PivotItem>
                </Pivot>
            </React.Fragment>
        );
    }
}

AdminRoute.propTypes = {
    history: propTypes.any,
};

export default AdminRoute;
