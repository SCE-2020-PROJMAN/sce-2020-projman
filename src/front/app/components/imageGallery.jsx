import React from 'react';
import propTypes from 'prop-types';
import {Image, ImageFit, IconButton} from 'office-ui-fabric-react';

class ImageGallery extends React.Component {
    constructor(props) {
        super(props);

        this.prevImage = this.prevImage.bind(this);
        this.nextImage = this.nextImage.bind(this);

        this.state = {
            currentImage: 0,
        };
    }

    prevImage() {
        this.setState(prevState => ({
            ...prevState,
            currentImage: prevState.currentImage <= 0 ? (this.props.imageUrls.length - 1) : (prevState.currentImage - 1),
        }));
    }

    nextImage() {
        this.setState(prevState => ({
            ...prevState,
            currentImage: (prevState.currentImage + 1) % this.props.imageUrls.length,
        }));
    }

    render() {
        if (!this.props.imageUrls || this.props.imageUrls.length === 0) {
            return <React.Fragment></React.Fragment>;
        }

        return (
            <div className="imageGallery">
                <Image
                    src={this.props.imageUrls[this.state.currentImage]}
                    imageFit={ImageFit.contain}
                    width={'100%'}
                    height={200}
                />
                {this.props.imageUrls.length > 1 && (
                    <React.Fragment>
                        <IconButton
                            className="prevButton"
                            iconProps={{iconName: 'chevronLeft'}}
                            onClick={this.prevImage}
                        />
                        <IconButton
                            className="nextButton"
                            iconProps={{iconName: 'chevronRight'}}
                            onClick={this.nextImage}
                        />
                    </React.Fragment>
                )}
            </div>
        );
    }
}

ImageGallery.propTypes = {
    imageUrls: propTypes.arrayOf(propTypes.string),
};

export default ImageGallery;
