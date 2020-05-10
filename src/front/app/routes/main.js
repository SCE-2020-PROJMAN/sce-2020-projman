import React from 'react';
import {MessageBar, MessageBarType, Spinner, SpinnerSize, TextField, Stack, PrimaryButton, ComboBox} from 'office-ui-fabric-react';
import StoreSelect from '../components/storeSelect';
import Product from '../components/product';
import Paginator from '../components/paginator';
import util from '../util';
import apiCall from '../apiCall';

class MainRoute extends React.Component {
    constructor(props) {
        super(props);

        this.selectStore = this.selectStore.bind(this);
        this.setPage = this.setPage.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeSort = this.handleChangeSort.bind(this);
        this.handleEditProduct = this.handleEditProduct.bind(this);

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

    selectStore(newStore) {
        this.setState(prevState => ({
            ...prevState,
            selectedStore: newStore,
        }));
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
                    {...prevState.products[index], isPatching: true},
                    ...prevState.products.slice(index + 1),
                ],
            }));
            apiCall('patch', 'product', productDelta)
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

    render() {
        return (
            <React.Fragment>
                <h1>SuperSami</h1>
                {this.state.selectedStore ? (
                    <React.Fragment>
                        <h2>Welcome to {util.capitalize(this.state.selectedStore)}</h2>

                        <form onSubmit={() => this.setPage(0)}>
                            <Stack horizontal style={{alignItems: 'flex-end', marginBottom: '1em'}}>
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
                                        {key: '', text: 'None'},
                                        {key: 'category=asc', text: 'Category (ascending)'},
                                        {key: 'category=desc', text: 'Category (descending)'},
                                        {key: 'price=asc', text: 'Price (ascending)'},
                                        {key: 'price=desc', text: 'Price (descending)'},
                                        {key: 'studentDiscount=asc', text: 'Price for students (ascending)'},
                                        {key: 'studentDiscount=desc', text: 'Price for students (descending)'},
                                        {key: 'brand=asc', text: 'Brand (ascending)'},
                                        {key: 'brand=desc', text: 'Brand (descending)'},
                                        {key: 'name=asc', text: 'Name (ascending)'},
                                        {key: 'name=desc', text: 'Name (descending)'},
                                    ]}
                                    selectedKey={this.state.sort}
                                    onChange={this.handleChangeSort}
                                />
                                <PrimaryButton
                                    iconProps={{iconName: 'search'}}
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
                                            name={product.name}
                                            brand={product.brand}
                                            category={product.category}
                                            freeText={product.freeText}
                                            price={product.price}
                                            studentDiscount={product.studentDiscount}
                                            isLoading={product.isPatching}
                                            isAvailable={true}
                                            isStudent={this.state.isStudent}
                                            isEditable={this.state.isAdmin}
                                            onAddToCart={(() => {})}
                                            onEdit={this.handleEditProduct(product.barcode)}
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

export default MainRoute;
