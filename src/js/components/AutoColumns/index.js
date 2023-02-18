import React, { Component } from 'react';

import style from './style/autocolumns.scss';

class AutoColumns extends Component {
    render() {
        const { content } = this.props;

        return (
            <article
                className={ style.autoColumns }
                dangerouslySetInnerHTML={{ __html: content }}
            />
        );
    }
}

export default AutoColumns;
