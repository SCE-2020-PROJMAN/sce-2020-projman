import React from 'react';
import propTypes from 'prop-types';
import {MessageBar, MessageBarType, Pivot, PivotItem} from 'office-ui-fabric-react';
import apiCall from '../../apiCall';
import Analytics from './analytics';
import Orders from './orders';

class AdminRoute extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            error: false,
        };
    }

    componentDidMount() {
        this.setState(prevState => ({
            ...prevState,
            error: false,
        }));
        apiCall('get', 'auth/who-am-i')
            .then(res => {
                if (!res.data.isAdmin) {
                    this.props.history.push('/login');
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
        if (this.state.error) {
            return <MessageBar messageBarType={MessageBarType.error}>
                There was an error. Try agian later
            </MessageBar>;
        }

        return (
            <React.Fragment>
                <h1>Admin</h1>
                <Pivot>
                    <PivotItem headerText="Orders">
                        <Orders/>
                    </PivotItem>
                    <PivotItem headerText="Analytics">
                        <Analytics/>
                    </PivotItem>
                </Pivot>
            </React.Fragment>
        );
    }
}

AdminRoute.propTypes = {
    history: propTypes.any,
};

export default AdminRoute;
