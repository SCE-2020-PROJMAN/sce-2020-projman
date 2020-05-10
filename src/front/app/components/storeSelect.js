import React from 'react';
import propTypes from 'prop-types';
import {PrimaryButton, Spinner, SpinnerSize, MessageBar, MessageBarType, ComboBox} from 'office-ui-fabric-react';
import apiCall from '../apiCall';
import util from '../util';

class StoreSelect extends React.Component {
    constructor(props) {
        super(props);

        this.setStore = this.setStore.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = {
            stores: null,
            error: false,
            selectedStore: '',
        };
    }

    componentDidMount() {
        apiCall('get', 'store/all')
            .then(res => {
                this.setState(prevState => ({
                    ...prevState,
                    stores: res.data.map(store => ({key: store.place, text: util.capitalize(store.place)})),
                }));
            })
            .catch(err => {
                console.error(err);
                this.setState(prevState => ({
                    ...prevState,
                    error: true,
                }));
            });
    }

    setStore(e, val) {
        this.setState(prevState => ({
            ...prevState,
            selectedStore: val,
        }));
    }

    handleSubmit(e) {
        e.preventDefault();

        if (!this.props.onSubmit || !this.state.stores || this.state.selectedStore === '') {
            return;
        }

        this.props.onSubmit(this.state.selectedStore.key);
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                {this.state.error ? (
                    <MessageBar
                        messageBarType={MessageBarType.error}
                    >
                        There was an error. Try again later!
                    </MessageBar>
                ) : (
                    <React.Fragment>
                        {this.state.stores ? (
                            <ComboBox
                                label="Store"
                                options={this.state.stores}
                                value={this.selectedStore}
                                onChange={this.setStore}
                            />
                        ) : (
                            <Spinner
                                label="Loading . . ."
                                size={SpinnerSize.large}
                            />
                        )}
                        <PrimaryButton
                            text="Continue"
                            type="submit"
                            disabled={!this.state.stores || this.state.selectedStore === ''}
                        />
                    </React.Fragment>
                )}
            </form>
        );
    }
}

StoreSelect.propTypes = {
    onSubmit: propTypes.func,
};

export default StoreSelect;
