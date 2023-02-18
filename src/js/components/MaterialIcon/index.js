import React, { Component } from 'react';

import style from './style/materialicon.scss';

class MaterialIcon extends Component {
    render() {
        const { icon, classes = { iconStyle: {} } } = this.props;

        return (
            <figure className={ `${style.icon} ${classes.iconStyle}` }>{ icon }</figure>
        );
    }
}

export default MaterialIcon;
