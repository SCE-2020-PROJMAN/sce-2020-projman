import React from 'react';
import propTypes from 'prop-types';
import jsBarcode from 'jsbarcode';

class Barcode extends React.Component {
    constructor(props) {
        super(props);

        this.updateCanvas = this.updateCanvas.bind(this);

        this.canvasRef = new React.createRef();
        this.state = {};
    }

    componentDidMount() {
        this.updateCanvas();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.value !== this.props.value) {
            this.updateCanvas();
        }
    }

    updateCanvas() {
        const canvas = this.canvasRef.current;
        if (!canvas) {
            return;
        }

        const options = {};
        const addOptionIfExists = key => {
            if (this.props[key] !== undefined) {
                options[key] = this.props[key];
            }
        };

        ['format', 'width', 'height', 'displayValue', 'text', 'fontOptions', 'font', 'textAlign', 'textPosition', 'textMargin', 'fontSize', 'background', 'lineColor', 'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'valid']
            .forEach(key => addOptionIfExists(key));

        jsBarcode(canvas, this.props.value, options);
    }

    render() {
        if (!this.props.value || this.props.value === '') {
            return <React.Fragment></React.Fragment>;
        }

        return (
            <canvas ref={this.canvasRef}></canvas>
        );
    }
}

Barcode.propTypes = {
    value: propTypes.any,
    format: propTypes.string, // eslint-disable-line react/no-unused-prop-types
    width: propTypes.number, // eslint-disable-line react/no-unused-prop-types
    height: propTypes.number, // eslint-disable-line react/no-unused-prop-types
    displayValue: propTypes.bool, // eslint-disable-line react/no-unused-prop-types
    text: propTypes.string, // eslint-disable-line react/no-unused-prop-types
    fontOptions: propTypes.string, // eslint-disable-line react/no-unused-prop-types
    font: propTypes.string, // eslint-disable-line react/no-unused-prop-types
    textAlign: propTypes.string, // eslint-disable-line react/no-unused-prop-types
    textPosition: propTypes.string, // eslint-disable-line react/no-unused-prop-types
    textMargin: propTypes.number, // eslint-disable-line react/no-unused-prop-types
    fontSize: propTypes.number, // eslint-disable-line react/no-unused-prop-types
    background: propTypes.string, // eslint-disable-line react/no-unused-prop-types
    lineColor: propTypes.string, // eslint-disable-line react/no-unused-prop-types
    margin: propTypes.number, // eslint-disable-line react/no-unused-prop-types
    marginTop: propTypes.number, // eslint-disable-line react/no-unused-prop-types
    marginBottom: propTypes.number, // eslint-disable-line react/no-unused-prop-types
    marginLeft: propTypes.number, // eslint-disable-line react/no-unused-prop-types
    marginRight: propTypes.number, // eslint-disable-line react/no-unused-prop-types
    valid: propTypes.func, // eslint-disable-line react/no-unused-prop-types
};

export default Barcode;
