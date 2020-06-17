import React from 'react';
import propTypes from 'prop-types';
import {Modal, IconButton, Spinner, SpinnerSize, TextField, MessageBar, MessageBarType, PrimaryButton} from 'office-ui-fabric-react';
import apiCall from '../../apiCall';

class AddToCartModal extends React.Component {
    constructor(props) {
        super(props);

        this.close = this.close.bind(this);
        this.addToCart = this.addToCart.bind(this);
        this.handleChange = this.handleChange.bind(this);

        this.state = {
            loading: false,
            error: false,
            amount: '',
        };
    }

    close() {
        this.setState(prevState => ({
            ...prevState,
            amount: '',
        }));
        this.props.onClose();
    }

    addToCart() {
        this.setState(prevState => ({
            ...prevState,
            loading: true,
            error: false,
        }));
        apiCall('post', 'shopping-cart', {
            store: this.props.selectedStore,
            barcode: this.props.barcode,
            amount: this.state.amount,
        })
            .then(() => {
                this.close();
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

    handleChange(key) {
        return (e, value) => {
            this.setState(prevState => ({
                ...prevState,
                [key]: value,
            }));
        };
    }

    render() {
        return (
            <Modal
                isOpen={this.props.isOpen}
                isBlocking={false}
                className="modal"
            >
                <div className="header">
                    <IconButton
                        className="closeButton"
                        iconProps={{ iconName: 'cancel' }}
                        onClick={this.close}
                    />
                </div>
                <div className="body">
                    {this.state.loading ? (
                        <Spinner
                            label="Processing . . ."
                            size={SpinnerSize.large}
                        />
                    ) : (
                        <TextField
                            label="Amount"
                            value={this.state.amount}
                            onChange={this.handleChange('amount')}
                            type="number"
                            iconProps={{ iconName: 'hash' }}
                        />
                    )}
                    {this.state.error && (
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
                        disabled={this.state.loading}
                    />
                </div>
            </Modal>
        );
    }
}

AddToCartModal.propTypes = {
    selectedStore: propTypes.string.isRequired,
    barcode: propTypes.string,
    isOpen: propTypes.bool.isRequired,
    onClose: propTypes.func.isRequired,
};

export default AddToCartModal;
