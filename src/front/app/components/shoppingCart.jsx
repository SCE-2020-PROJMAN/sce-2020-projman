import React from 'react';
import propTypes from 'prop-types';
import {Spinner, SpinnerSize, MessageBar, MessageBarType, Stack, IconButton, PrimaryButton, Modal, TextField} from 'office-ui-fabric-react';
import apiCall from '../apiCall';
import priceUtil from '../../../util/price';
import Product from './product';

class ShoppingCart extends React.Component {
    constructor(props) {
        super(props);

        this.updateCart = this.updateCart.bind(this);
        this.removeFromCart = this.removeFromCart.bind(this);
        this.openAddToCartDialog = this.openAddToCartDialog.bind(this);
        this.addToCart = this.addToCart.bind(this);
        this.handleChange = this.handleChange.bind(this);

        this.state = {
            loading: false,
            error: false,
            isCustomer: false,
            isStudent: false,
            items: [],
            suggestions: [],
            deletingItem: false,
        };
    }

    componentDidMount() {
        this.updateCart();
        apiCall('get', 'auth/who-am-i')
            .then(res => {
                this.setState(prevState => ({
                    ...prevState,
                    isCustomer: res.data.isCustomer,
                    isStudent: res.data.isStudent,
                }));
            });
    }

    updateCart() {
        this.setState(prevState => ({
            ...prevState,
            loading: true,
            error: false,
        }));
        Promise.all([
            apiCall('get', 'shopping-cart')
                .then(res => {
                    this.setState(prevState => ({
                        ...prevState,
                        items: res.data,
                    }));
                }),
            apiCall('get', 'shopping-cart/suggestion')
                .then(res => {
                    this.setState(prevState => ({
                        ...prevState,
                        suggestions: res.data,
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

    openAddToCartDialog(barcode) {
        return () => {
            this.setState(prevState => ({
                ...prevState,
                addToCartModalIsOpen: true,
                addToCartBarcode: barcode,
            }));
        };
    }

    addToCart() {
        this.setState(prevState => ({
            ...prevState,
            addToCartLoading: true,
            addToCartError: false,
        }));
        apiCall('post', 'shopping-cart', {
            store: sessionStorage.getItem('selectedStore'),
            barcode: this.state.addToCartBarcode,
            amount: this.state.addToCartAmount,
        })
            .then(() => {
                this.setState(prevState => ({
                    ...prevState,
                    addToCartModalIsOpen: false,
                    addToCartAmount: '',
                    addToCartBarcode: null,
                }));
                this.updateCart();
            })
            .catch(err => {
                console.error(err);
                this.setState(prevState => ({
                    ...prevState,
                    addToCartError: true,
                }));
            })
            .finally(() => {
                this.setState(prevState => ({
                    ...prevState,
                    addToCartLoading: false,
                }));
            });
    }

    handleChange(key) {
        return (e, value) => {
            this.setState(prevState => ({
                ...prevState,
                [key]: value,
            }));
        };
    }

    render() {
        const calculatePrice = item => priceUtil.getPrice(this.props.isStudent, item.price, item.studentDiscount) * item.amountInCart;
        const calculateSubtotal = () => this.state.items.reduce((subtotal, item) => subtotal + calculatePrice(item), 0);

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
                <div className="productList" style={{backgroundColor: '#eee'}}>
                    {this.state.suggestions.map(product =>
                        <Product
                            key={product.barcode}
                            barcode={product.barcode}
                            name={product.name}
                            brand={product.brand}
                            category={product.category}
                            freeText={product.freeText}
                            price={product.price}
                            studentDiscount={product.studentDiscount}
                            amount={1}
                            imageUrls={(product.images || []).map(image => image.url)}
                            isLoading={false}
                            isAvailable={true}
                            isStudent={this.state.isStudent}
                            isEditable={false}
                            onAddToCart={this.state.isCustomer ? this.openAddToCartDialog(product.barcode) : null}
                        />
                    )}
                </div>
                <div>
                    <p>Subtotal: {calculateSubtotal()}</p>
                </div>

                <Modal
                    isOpen={this.state.addToCartModalIsOpen}
                    isBlocking={false}
                    className="modal"
                >
                    <div className="header">
                        <IconButton
                            className="closeButton"
                            iconProps={{ iconName: 'cancel' }}
                            onClick={() => this.setState(prevState => ({ ...prevState, addToCartModalIsOpen: false, addToCartAmount: '' }))}
                        />
                    </div>
                    <div className="body">
                        {this.state.addToCartLoading ? (
                            <Spinner
                                label="Processing . . ."
                                size={SpinnerSize.large}
                            />
                        ) : (
                            <TextField
                                label="Amount"
                                value={this.state.addToCartAmount}
                                onChange={this.handleChange('addToCartAmount')}
                                type="number"
                                iconProps={{ iconName: 'hash' }}
                            />
                        )}
                        {this.state.addToCartError && (
                            <MessageBar messageBarType={MessageBarType.error}>
                                An error occurred. Try again later.
                            </MessageBar>
                        )}
                    </div>
                    <div className="footer">
                        <PrimaryButton
                            iconProps={{ iconName: 'cartPlus' }}
                            text="Add to cart"
                            type="button"
                            onClick={this.addToCart}
                            disabled={this.state.addToCartLoading}
                        />
                    </div>
                </Modal>
            </Stack>
        );
    }
}

ShoppingCart.propTypes = {
    isStudent: propTypes.bool,
};

export default ShoppingCart;
