import React from 'react';
import apiCall from '../apiCall';
import propTypes from 'prop-types';
import {PrimaryButton, Spinner, SpinnerSize, MessageBar, MessageBarType, ComboBox} from 'office-ui-fabric-react';
import util from '../util';


class receipt extends React.Component{
    constructor(props){
        super(props);
        this.onGetReceipt=this.onGetReceipt.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state={
            dates:[],
            error:false,
            selectedDate:'',
        };
    }
    componentDidMount(){
        apiCall('get','receipt/orderCreationTime')
            .then(res=>{
                this.setState(prevState=>({
                    ...prevState,
                    dates:res.data.map(order=>({key:order.creationTime,text:util.toLocaleDateString(order.creationTime)})),
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
    setReceipt(val){
        this.setState(prevState => ({
            ...prevState,
            selectedDate: val,
        }));
    }
    handleSubmit(e){
        e.preventDefault();
        if (!this.props.onSubmit || !this.state.dates || this.state.selectedDate === '') {
            return;
        }
        this.props.onSubmit(this.state.wantedOrderCreationTime);
    }
    render() {
        return (
            <React.Fragment>
                <h1>Receipts Page</h1>
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
                                    label="Date"
                                    options={this.state.dates}
                                    selectedKey={this.selectedDate}
                                    onChange={this.setReceipt}
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
                                disabled={!this.state.dates || this.state.selectedDate === ''}
                            />
                        </React.Fragment>
                    )}
                </form>
            </React.Fragment>
        );
    }

}
receipt.propTypes={
    onSubmit:propTypes.func,
};

export default receipt;
