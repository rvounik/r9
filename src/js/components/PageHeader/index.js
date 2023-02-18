import React, { Component } from 'react';

import style from './style/pageheader.scss';

class PageHeader extends Component {
    render() {
        const { title, children } = this.props;

        return (
            <header className={ style.pageHeader }>
                <h2>{ title }</h2>
                { children }
            </header>
        );
    }
}

export default PageHeader;
