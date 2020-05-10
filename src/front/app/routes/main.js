import React from 'react';
import StoreSelect from '../components/storeSelect';
import util from '../util';

class MainRoute extends React.Component {
    constructor(props) {
        super(props);

        this.selectStore = this.selectStore.bind(this);

        this.state = {};
    }

    selectStore(newStore) {
        this.setState(prevState => ({
            ...prevState,
            selectedStore: newStore,
        }));
    }

    render() {
        return (
            <React.Fragment>
                <h1>SuperSami</h1>
                {this.state.selectedStore ? (
                    <React.Fragment>
                        <h2>Welcome to {util.capitalize(this.state.selectedStore)}</h2>
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
