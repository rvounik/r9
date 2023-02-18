import AppConfig from './../../../../config/App.config.js';

import React, { Component } from 'react';

import Pages from './constants/pages';

import style from './style/navigation.scss';

class Navigation extends Component {
    handleClick = page => {
        document.location.href = AppConfig.api.routes[page.toLowerCase()];
    };

    render() {
        const { navMainFixed, active } = this.props;

        return (
            <nav id="nav_main" className={ navMainFixed ? style.navMain__fixed : style.navMain }>
                <ul>
                    { Object.keys(Pages).map(page =>
                        <li
                            key={ Pages[page] }
                            className={ active && active.toString() === page.toString() ? style.active : '' }
                            onClick={ () => {
                                this.handleClick(page);
                            } }
                        >{ Pages[page] }</li>
                    )}
                </ul>
            </nav>
        );
    }
}

export default Navigation;
