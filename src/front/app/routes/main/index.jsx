import React from 'react';
import propTypes from 'prop-types';
import { MessageBar, MessageBarType, Spinner, SpinnerSize, TextField, Stack, PrimaryButton, ComboBox, Panel } from 'office-ui-fabric-react';
import StoreSelect from '../../components/storeSelect';
import Product from '../../components/product';
import Paginator from '../../components/paginator';
import util from '../../util';
import apiCall from '../../apiCall';
import CreateProduct from './createProduct';
import ShoppingCart from '../../components/shoppingCart';
import NavBar from './navbar';
import AddToCartModal from './addToCartModal';

class MainRoute extends React.Component {
    constructor(props) {
        super(props);

        this.openAddToCartDialog = this.openAddToCartDialog.bind(this);
        this.onCloseCartDialog = this.onCloseCartDialog.bind(this);
        this.selectStore = this.selectStore.bind(this);
        this.setPage = this.setPage.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeSort = this.handleChangeSort.bind(this);
        this.handleEditProduct = this.handleEditProduct.bind(this);
        this.addProduct = this.addProduct.bind(this);
        this.onDeleteProduct = this.onDeleteProduct.bind(this);
        this.onChangeAmount = this.onChangeAmount.bind(this);
        this.state = {
            page: 0,
            pages: 0,
            loading: false,
            products: [],
            sort: '',
            search: '',
            isAdmin: false,
            isCustomer: false,
            isStudent: false,
            addToCartBarcode: null,
            shoppingCartIsOpen: false,
            addToCartModalIsOpen: false,
        };
    }
    
    componentDidMount() {
        apiCall('get', 'auth/who-am-i')
            .then(res => {
                this.setState(prevState => ({
                    ...prevState,
                    isAdmin: res.data.isAdmin,
                    isCustomer: res.data.isCustomer,
                    isStudent: res.data.isStudent,
                }));
            })
            .catch(err => {
                console.error(err);
            });
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

    onCloseCartDialog() {
        this.setState(prevState => ({
            ...prevState,
            addToCartModalIsOpen: false,
            addToCartBarcode: null,
        }));
    }

    onDeleteProduct(barcode) {
        return () => {
            apiCall('delete', 'product/' + barcode)
                .then(() => {
                    const index = this.state.products.findIndex(product => barcode === product.barcode);
                    this.setState(prevState => ({
                        ...prevState,
                        products: [
                            ...prevState.products.slice(0, index),
                            ...prevState.products.slice(index + 1),
                        ],
                    }));
                })
                .catch(err => {
                    console.error(err);
                });
        };
    }
    
    selectStore(newStore) {
        this.setState(prevState => ({
            ...prevState,
            selectedStore: newStore,
        }));
        sessionStorage.setItem('selectedStore', newStore);
        setTimeout(() => {
            this.setPage(0);
        });
    }

    setPage(newPage) {
        this.setState(prevState => ({
            ...prevState,
            page: newPage,
            loading: true,
            error: false,
        }));
        apiCall('get', 'product/search', {
            sort: this.state.sort,
            search: this.state.search,
            page: newPage,
        })
            .then(res => {
                this.setState(prevState => ({
                    ...prevState,
                    products: res.data.products,
                    pages: res.data.pages,
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

    handleChange(key) {
        return (e, value) => {
            this.setState(prevState => ({
                ...prevState,
                [key]: value,
            }));
        };
    }

    handleChangeSort(e, val) {
        this.setState(prevState => ({
            ...prevState,
            sort: val.key,
        }));
    }

    handleEditProduct(barcode) {
        return product => {
            const index = this.state.products.findIndex(product => barcode === product.barcode);
            if (index === -1) {
                return;
            }
            const productDelta = {
                ...product,
                barcode: barcode,
            };
            this.setState(prevState => ({
                ...prevState,
                products: [
                    ...prevState.products.slice(0, index),
                    { ...prevState.products[index], isPatching: true },
                    ...prevState.products.slice(index + 1),
                ],
            }));
            const promises = [apiCall('patch', `product/${product.barcode}`, productDelta)];
            const imageUrls = productDelta.imageUrls;
            if (imageUrls) {
                promises.push(apiCall('post', `product/${product.barcode}/image`, {imageUrls: imageUrls}));
                delete productDelta.imageUrls;
            }
            Promise.all(promises)
                .then(() => {
                    const index = this.state.products.findIndex(product => barcode === product.barcode);
                    this.setState(prevState => ({
                        ...prevState,
                        products: [
                            ...prevState.products.slice(0, index),
                            {
                                ...prevState.products[index],
                                isPatching: false,
                                ...productDelta,
                                images: imageUrls ? imageUrls.map(url => ({
                                    url: url,
                                })) : prevState.products[index].images,
                            },
                            ...prevState.products.slice(index + 1),
                        ],
                    }));
                })
                .catch(err => {
                    console.error(err);
                });
        };
    }

    addProduct(product) {
        this.setState(prevState => ({
            ...prevState,
            products: [product, ...prevState.products],
        }));
    }

    onChangeAmount(barcode) {
        return amount => {
            apiCall('patch', `store/${this.state.selectedStore}/product/${barcode}`, { amount: amount })
                .then(() => {
                    this.setState(prevState => {
                        const productIndex = prevState.products.findIndex(product => barcode === product.barcode);
                        if (productIndex === -1) {
                            return prevState;
                        }
                        const oldProduct = prevState.products[productIndex];
                        const storeProductIndex = oldProduct.storeProducts.findIndex(product => product.storePlace === prevState.selectedStore);
                        if (storeProductIndex === -1) {
                            return prevState;
                        }
                        return {
                            ...prevState,
                            products: [
                                ...prevState.products.slice(0, productIndex),
                                {
                                    ...oldProduct,
                                    storeProducts: [
                                        ...oldProduct.storeProducts.slice(0, storeProductIndex),
                                        {
                                            ...oldProduct.storeProducts[storeProductIndex],
                                            amount: Number(amount),
                                        },
                                        ...oldProduct.storeProducts.slice(storeProductIndex + 1),
                                    ],
                                },
                                ...prevState.products.slice(productIndex + 1),
                            ],
                        };
                    });
                });
        };
    }

    render() {
        const getAmount = product => {
            if (!product || !product.storeProducts) {
                return 0;
            }
            const storeProduct = product.storeProducts.find(product => product.storePlace === this.state.selectedStore);
            if (!storeProduct) {
                return 0;
            }
            return storeProduct.amount;
        };

        const isAvailable = product => {
            return getAmount(product) > 0;
        };

        return (
            <React.Fragment>
                <h1>SuperSami</h1>
                {this.state.selectedStore ? (
                    <React.Fragment>
                        <h2>Welcome to {util.capitalize(this.state.selectedStore)}</h2>

                        <NavBar
                            isAdmin={this.state.isAdmin}
                            isCustomer={this.state.isCustomer}
                            onToggleShoppingCart={() => this.setState(prevState => ({...prevState, shoppingCartIsOpen: true}))}
                            history={this.props.history}
                        />

                        {this.state.isAdmin && (
                            <CreateProduct
                                store={this.state.selectedStore}
                                onSuccessfulSubmit={this.addProduct}
                            />
                        )}

                        <form onSubmit={e => {e.preventDefault();this.setPage(0);}}>
                            <Stack horizontal style={{ alignItems: 'flex-end', marginBottom: '1em' }}>
                                <Stack.Item grow={1}>
                                    <TextField
                                        label="Search"
                                        value={this.state.search}
                                        onChange={this.handleChange('search')}
                                    />
                                </Stack.Item>
                                <ComboBox
                                    label="Sort"
                                    options={[
                                        { key: '', text: 'None' },
                                        { key: 'category=asc', text: 'Category (ascending)' },
                                        { key: 'category=desc', text: 'Category (descending)' },
                                        { key: 'price=asc', text: 'Price (ascending)' },
                                        { key: 'price=desc', text: 'Price (descending)' },
                                        { key: 'studentDiscount=asc', text: 'Price for students (ascending)' },
                                        { key: 'studentDiscount=desc', text: 'Price for students (descending)' },
                                        { key: 'brand=asc', text: 'Brand (ascending)' },
                                        { key: 'brand=desc', text: 'Brand (descending)' },
                                        { key: 'name=asc', text: 'Name (ascending)' },
                                        { key: 'name=desc', text: 'Name (descending)' },
                                    ]}
                                    selectedKey={this.state.sort}
                                    onChange={this.handleChangeSort}
                                />
                                <PrimaryButton
                                    iconProps={{ iconName: 'search' }}
                                    text="Search"
                                    type="submit"
                                />
                            </Stack>
                        </form>

                        {this.state.loading ? (
                            <Spinner
                                label="Loading . . ."
                                size={SpinnerSize.large}
                            />
                        ) : (
                            this.state.error ? (
                                <MessageBar messageBarType={MessageBarType.error}>
                                        There was an error. Try agian later
                                </MessageBar>
                            ) : (
                                <div className="productList">
                                    {this.state.products.map(product =>
                                        <Product
                                            key={product.barcode}
                                            barcode={product.barcode}
                                            name={product.name}
                                            brand={product.brand}
                                            category={product.category}
                                            freeText={product.freeText}
                                            price={product.price}
                                            studentDiscount={product.studentDiscount}
                                            amount={getAmount(product)}
                                            imageUrls={(product.images || []).map(image => image.url)}
                                            isLoading={product.isPatching}
                                            isAvailable={isAvailable(product)}
                                            isStudent={this.state.isStudent}
                                            isEditable={this.state.isAdmin}
                                            onAddToCart={this.state.isCustomer ? this.openAddToCartDialog(product.barcode) : null}
                                            onEdit={this.handleEditProduct(product.barcode)}
                                            onDeleteProduct={this.onDeleteProduct(product.barcode)}
                                            onChangeAmount={this.onChangeAmount(product.barcode)}
                                        />
                                    )}
                                </div>
                            )
                        )}
                        <Paginator
                            page={this.state.page}
                            pages={this.state.pages}
                            onSelectPage={this.setPage}
                        />

                        <Panel
                            headerText="Shopping Cart"
                            isOpen={this.state.shoppingCartIsOpen}
                            onDismiss={() => this.setState(prevState => ({ ...prevState, shoppingCartIsOpen: false }))}
                            closeButtonAriaLabel="Close"
                        >
                            <ShoppingCart
                                isStudent={this.state.isStudent}
                            />
                            <PrimaryButton
                                text="Check Out"
                                type="button"
                                onClick={() => this.props.history.push('/checkout')}
                            />
                        </Panel>

                        <AddToCartModal
                            selectedStore={this.state.selectedStore}
                            barcode={this.state.addToCartBarcode}
                            isOpen={this.state.addToCartModalIsOpen}
                            onClose={this.onCloseCartDialog}
                        />
                    </React.Fragment>
                ) : (
                    <StoreSelect
                        onSubmit={this.selectStore}
                    />
                )}
            </React.Fragment>
        );
    }
}

MainRoute.propTypes = {
    history: propTypes.any,
};

export default MainRoute;
