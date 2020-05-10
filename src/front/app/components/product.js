import React from 'react';
import propTypes from 'prop-types';
import {FontIcon, DefaultButton} from 'office-ui-fabric-react';

function ProductComponent(props) {
    return (
        <div className="product">
            <div className="header">
                <div className="name">{props.name}</div>
                <div className="brand">{props.brand}</div>
                <div className="category">{props.category}</div>
            </div>
            <div className="body">
                <div className="description">{props.freeText}</div>
            </div>
            <div className="footer">
                <div className="price">
                    {props.isStudent ? (
                        <React.Fragment>
                            <span className="strike">{props.price}</span>
                            {props.studentDiscount}
                        </React.Fragment>
                    ) : (
                        props.price
                    )}
                    <FontIcon className="icon" iconName="shekel"/>
                </div>
                <div className="cartControl">
                    {props.isAvailable ? (
                        <DefaultButton
                            iconProps={{iconName: 'cartPlus'}}
                            text="Add to cart"
                            disabled={!props.onAddToCart}
                            onClick={props.onAddToCart}
                        />
                    ) : (
                        <div className="availability">Unavailable</div>
                    )}
                </div>
            </div>
        </div>
    );
}

ProductComponent.propTypes = {
    name: propTypes.string.isRequired,
    brand: propTypes.string.isRequired,
    category: propTypes.string.isRequired,
    freeText: propTypes.string.isRequired,
    price: propTypes.string.isRequired,
    studentDiscount: propTypes.string.isRequired,
    isAvailable: propTypes.bool.isRequired,
    isStudent: propTypes.bool,
    onAddToCart: propTypes.func,
};

export default ProductComponent;
