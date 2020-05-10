import React from 'react';
import {registerIcons} from '@uifabric/styling';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faChevronRight,
    faChevronLeft,
    faChevronDown,
    faChevronUp,
    faCheckCircle,
    faTimesCircle,
    faInfoCircle,
    faShekelSign,
    faCartPlus,
    faSearch,
    faSave,
    faTimes,
    faEdit,
} from '@fortawesome/free-solid-svg-icons';

const iconMap = {
    chevronRight: faChevronRight,
    chevronLeft: faChevronLeft,
    chevronDown: faChevronDown,
    chevronUp: faChevronUp,
    completed: faCheckCircle,
    errorbadge: faTimesCircle,
    info: faInfoCircle,
    shekel: faShekelSign,
    cartPlus: faCartPlus,
    search: faSearch,
    save: faSave,
    cancel: faTimes,
    edit: faEdit,
};

function initialize() {
    const icons = {};
    Object.keys(iconMap).forEach(iconKey => {
        icons[iconKey] = <FontAwesomeIcon icon={iconMap[iconKey]}/>;
    });
    registerIcons({icons});
}

export default {
    initialize,
};
