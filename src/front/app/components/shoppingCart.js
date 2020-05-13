import React from 'react';
import propTypes from 'prop-types';
import {Spinner, SpinnerSize, MessageBar, MessageBarType, Stack, IconButton} from 'office-ui-fabric-react';
import apiCall from '../apiCall';
import priceUtil from '../../../util/price';

class ShoppingCart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            error: false,
            items: [],
            deletingItem: false,
        };
    }

    componentDidMount() {
        this.updateCart();
    }

    updateCart() {
        this.setState(prevState => ({
            ...prevState,
            loading: true,
            error: false,
        }));
        apiCall('get', 'shopping-cart')
            .then(res => {
                this.setState(prevState => ({
                    ...prevState,
                    items: res.data,
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

    removeFromCart(id) {
        return () => {
            this.setState(prevState => ({
                ...prevState,
                deletingItem: true,
            }));
            apiCall('delete', `shopping-cart/${id}`)
                .then(() => {
                    this.updateCart();
                })
                .catch(err => {
                    console.error(err);
                })
                .finally(() => {
                    this.setState(prevState => ({
                        ...prevState,
                        deletingItem: false,
                    }));
                });
        };
    }

    render() {
        const calculatePrice = (item) => {
            return priceUtil.getPrice(this.props.isStudent, item.price, item.studentDiscount) * item.amountInCart;
        };

        const calculateSubtotal = () => {
            return this.state.items.reduce((subtotal, item) => subtotal + calculatePrice(item), 0);
        };

        if (this.state.loading) {
            return <Spinner size={SpinnerSize.large}/>;
        }

        if (this.state.error) {
            return (
                <MessageBar messageBarType={MessageBarType.error}>
                    An error occurred. Try again later.
                </MessageBar>
            );
        }

        return (
            <Stack vertical>
                <Stack.Item grow={1}>
                    {this.state.items.map(item =>
                        <Stack horizontal key={item.barcode}>
                            <Stack.Item grow={1}>
                                x{item.amountInCart} {item.name}: {calculatePrice(item)}
                            </Stack.Item>
                            <IconButton
                                onClick={this.removeFromCart(item.idInShoppingCart)}
                                iconProps={{iconName: 'cancel'}}
                                disabled={this.state.deletingItem}
                            />
                        </Stack>
                    )}
                </Stack.Item>
                <div>
                    <p>Subtotal: {calculateSubtotal()}</p>
                </div>
            </Stack>
        );
    }
}

ShoppingCart.propTypes = {
    isStudent: propTypes.bool,
};

export default ShoppingCart;
