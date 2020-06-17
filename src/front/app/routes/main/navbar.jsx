import React from 'react';
import propTypes from 'prop-types';
import {Stack, DefaultButton} from 'office-ui-fabric-react';

function NavBar(props) {
    function logout() {
        sessionStorage.removeItem('authToken');
        props.history.push('/login');
        window.location.reload();
    }

    return (
        <Stack horizontal style={{ position: 'absolute', top: '0', right: '0' }}>
            {props.isAdmin && (
                <DefaultButton href="#/admin">Admin Panel</DefaultButton>
            )}
            {props.isCustomer && (
                <React.Fragment>
                    <DefaultButton href="#/personalDetails">Personal Details</DefaultButton>
                    <DefaultButton
                        onClick={props.onToggleShoppingCart}
                        iconProps={{ iconName: 'shoppingCart' }}
                    />
                </React.Fragment>
            )}
            <DefaultButton
                text="Log Out"
                type="button"
                onClick={logout}
            />
        </Stack>
    );
}

NavBar.propTypes = {
    history: propTypes.any,
    isAdmin: propTypes.bool.isRequired,
    isCustomer: propTypes.bool.isRequired,
    onToggleShoppingCart: propTypes.func.isRequired,
};

export default NavBar;
