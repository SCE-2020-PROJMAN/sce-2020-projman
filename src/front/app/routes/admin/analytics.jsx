import React from 'react';
import {Spinner, SpinnerSize, MessageBar, MessageBarType} from 'office-ui-fabric-react';
import {HorizontalBar} from 'react-chartjs-2';
import apiCall from '../../apiCall';
import util from '../../util';

class Analytics extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            revenue: {
                loading: false,
                error: false,
                total: 0,
                perCategory: {},
                perDayOfWeek: {},
            },
        };
    }

    componentDidMount() {
        this.setState(prevState => ({
            ...prevState,
            loading: true,
            error: false,
        }));
        apiCall('get', 'order/analytics')
            .then(res => {
                this.setState(prevState => ({
                    ...prevState,
                    ...res.data,
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
        if (this.state.loading) {
            return <Spinner
                label="Loading . . ."
                size={SpinnerSize.large}
            />;
        }
        
        if (this.state.error) {
            return <MessageBar messageBarType={MessageBarType.error}>
                There was an error. Try agian later
            </MessageBar>;
        }

        return (
            <React.Fragment>
                <p>Total revenue: {this.state.revenue.total}</p>
                {Object.keys(this.state.revenue.perCategory || {}).map(categoryName =>
                    <p key={categoryName}>
                        Revenue ({categoryName} category): {this.state.revenue.perCategory[categoryName]}
                    </p>
                )}
                <HorizontalBar
                    height={64}
                    data={{
                        labels: Object.keys(this.state.revenue.perDayOfWeek || {}).map(day => util.capitalize(day)),
                        datasets: [{
                            label: 'Revenue',
                            backgroundColor: '#2e9636',
                            data: Object.values(this.state.revenue.perDayOfWeek || {}),
                        }],
                    }}
                    options={{
                        legend: {display: false},
                    }}
                />
            </React.Fragment>
        );
    }
}

export default Analytics;
