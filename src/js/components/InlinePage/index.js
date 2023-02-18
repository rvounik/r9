import AppConfig from '../../../../config/App.config';
import Helpers from '../../helpers';

import React, { Component } from 'react';

import style from './style/inlinepage.scss';

class InlinePage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            page: null
        };
    }

    componentDidMount() {
        if (this.props.slug) {
            this.getInlinePage(this.props.slug);
        }
    }

    /**
     * Get inline page
     */
    getInlinePage = slug => {
        Helpers.Api.expressRequest(
            `${AppConfig.api.baseUrl}/api/page/${slug}`,
            'GET'
        ).then(result => {

            // results go to state so they can be displayed (unless on initial load)
            this.setState({
                page: result || {}
            });

        }).catch(() => {
        });
    };

    render() {
        return (
            <section className={ style.inlinePage }>
                { this.state.page
                    ? <div dangerouslySetInnerHTML={{ __html: this.state.page.description }} />
                    : null
                }
            </section>
        );
    }
}

export default InlinePage;
