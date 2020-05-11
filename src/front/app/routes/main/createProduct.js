import React from 'react';
import propTypes from 'prop-types';
import {MessageBar, MessageBarType, TextField, DefaultButton} from 'office-ui-fabric-react';
import Product from '../../components/product';
import apiCall from '../../apiCall';

class CreateProduct extends React.Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = {
            creatingProduct: false,
            error: false,
            barcode: '',
        };
    }

    handleChange(key) {
        return (e, value) => {
            this.setState(prevState => ({
                ...prevState,
                [key]: value,
            }));
        };
    }

    handleSubmit(productDetails) {
        const newProduct = {
            ...productDetails,
            barcode: this.state.barcode,
            storePlace: this.props.store,
        };
        this.setState(prevState => ({
            ...prevState,
            error: false,
        }));
        apiCall('post', 'product', newProduct)
            .then(() => {
                this.setState(prevState => ({
                    ...prevState,
                }));
                if (this.props.onSuccessfulSubmit) {
                    this.props.onSuccessfulSubmit(newProduct);
                }
            })
            .catch(err => {
                console.error(err);
                this.setState(prevState => ({
                    ...prevState,
                    error: true,
                }));
            });
    }

    render() {
        return (
            <React.Fragment>
                <DefaultButton
                    iconProps={{iconName: this.state.creatingProduct ? 'minus' : 'plus'}}
                    text={this.state.creatingProduct ? 'Cancel' : 'New Product'}
                    type="button"
                    onClick={() => this.setState(prevState => ({...prevState, creatingProduct: !prevState.creatingProduct}))}
                />
                {this.state.creatingProduct && (
                    <React.Fragment>
                        <TextField
                            label="Barcode"
                            value={this.state.barcode}
                            onChange={this.handleChange('barcode')}
                        />
                        <Product
                            name=""
                            brand=""
                            category=""
                            freeText=""
                            price=""
                            studentDiscount=""
                            isEditing={true}
                            onEdit={this.handleSubmit}
                            onCancelEdit={() => this.setState(prevState => ({...prevState, creatingProduct: false}))}
                        />
                    </React.Fragment>
                )}
                {this.state.error && (
                    <MessageBar messageBarType={MessageBarType.error}>
                        An error occurred. Try again later.
                    </MessageBar>
                )}
            </React.Fragment>
        );
    }
}

CreateProduct.propTypes = {
    store: propTypes.string.isRequired,
    onSuccessfulSubmit: propTypes.func,
};

export default CreateProduct;
