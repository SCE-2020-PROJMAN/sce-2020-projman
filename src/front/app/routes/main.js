import React from 'react';
import {MessageBar, MessageBarType, Spinner, SpinnerSize} from 'office-ui-fabric-react';
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

        this.state = {
            page: 0,
            pages: 0,
            loading: false,
            products: [],
        };
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
            sort: '',
            search: '',
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

    render() {
        return (
            <React.Fragment>
                <h1>SuperSami</h1>
                {this.state.selectedStore ? (
                    <React.Fragment>
                        <h2>Welcome to {util.capitalize(this.state.selectedStore)}</h2>
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
                                            isAvailable={true}
                                            isStudent={false}
                                            onAddToCart={(() => {})}
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
