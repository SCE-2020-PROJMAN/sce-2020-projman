import React from 'react';
import propTypes from 'prop-types';
import {Spinner, SpinnerSize, MessageBar, MessageBarType, Stack, PrimaryButton} from 'office-ui-fabric-react';
import apiCall from '../../apiCall';

class ShoppingCart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            error: false,
            items: [],
        };
    }

    componentDidMount() {
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

    render() {
        const calculatePrice = (item) => {
            const getPrice = () => {
                if (this.props.isStudent && item.studentDiscount && item.studentDiscount !== 0 && item.studentDiscount !== '0' && item.studentDiscount !== '0.0' && item.studentDiscount !== '0.00') {
                    return item.studentDiscount;
                }
                return item.price;
            };
            return getPrice() * item.amountInCart;
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
                        <div key={item.barcode}>
                            x{item.amountInCart} {item.name}: {calculatePrice(item)}
                        </div>
                    )}
                </Stack.Item>
                <div>
                    <p>Subtotal: {calculateSubtotal()}</p>
                    <PrimaryButton
                        text="Check Out"
                        type="button"
                    />
                </div>
            </Stack>
        );
    }
}

ShoppingCart.propTypes = {
    isStudent: propTypes.bool,
};

export default ShoppingCart;
