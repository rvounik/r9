import React, { Component } from 'react';

import style from './style/alert.scss';

class Alert extends Component {
    hide = event => {
        event.target.classList.add(style.hidden);
    };

    render() {
        const { alert } = this.props;

        return (
            <div
                className={ style[alert.type] }
                onClick={ event => {
                    this.hide(event);
                } }
            >{ alert.text }<span>x</span>
            </div>
        );
    }
}

export default Alert;
