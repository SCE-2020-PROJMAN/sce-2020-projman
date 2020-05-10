import React from 'react';
import propTypes from 'prop-types';
import {Stack, DefaultButton} from 'office-ui-fabric-react';

function Paginator(props) {
    function selectPage(page) {
        return () => {
            if (props.onSelectPage) {
                props.onSelectPage(page);
            }
        };
    }

    if (!props.pages || props.pages === 1) {
        return <React.Fragment></React.Fragment>;
    }

    return (
        <Stack horizontal>
            <DefaultButton
                iconProps={{iconName: 'chevronLeft'}}
                disabled={props.page === 0}
                onClick={selectPage(props.page - 1)}
            />
            {[...Array(props.pages).keys()].map(page => 
                <DefaultButton
                    key={page}
                    text={page}
                    disabled={props.page === page}
                    onClick={selectPage(page)}
                />
            )}
            <DefaultButton
                iconProps={{iconName: 'chevronRight'}}
                disabled={props.page >= props.pages - 1}
                onClick={selectPage(props.page + 1)}
            />
        </Stack>
    );
}

Paginator.propTypes = {
    page: propTypes.number,
    pages: propTypes.number,
    onSelectPage: propTypes.func,
};

export default Paginator;
