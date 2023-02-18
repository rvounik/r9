import AppConfig from './../../../../config/App.config.js';
import Helpers from './../../helpers/index.js';

import React, { Component, Fragment } from 'react';
import { v4 as uuidv4 } from 'uuid';

import AlertTypes from './../../constants/AlertTypes';
import AlertTexts from './../../constants/AlertTexts';

import Alert from '../../components/Alert/Alert';
import Hero from '../../components/Hero';
import Navigation from '../../components/Navigation';
import PageHeader from './../../components/PageHeader';
import AutoColumns from '../../components/AutoColumns';
import Footer from '../../components/Footer';

class Page extends Component {
    constructor(props) {
        super(props);

        this.state = {
            page: null,
            alerts: [],
            navMainFixed: false
        };
    }

    componentDidMount() {
        window.addEventListener('scroll', event => {
            this.scrollHandler(event);
        }, true);

        this.getPage();
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.scrollHandler, true);
    }

    /**
     * Checks if page is scrolled past a certain threshold, then toggles a state property
     */
    scrollHandler = event => {
        this.setState({
            navMainFixed: event.currentTarget.scrollY > AppConfig.global.stickyNavThreshold
        });
    };

    /**
     * Saves given alert to state so it can be displayed
     * @param {string} type - the type of alert, to determine the style
     * @param {string} text - the text to show in the alert
     */
    setAlert = (type, text) => {
        let alerts = this.state.alerts;
        const alertId = uuidv4();

        alerts.push(
            {
                id: alertId,
                type,
                text
            }
        );

        this.setState({
            alerts
        }, () => {
            setTimeout(() => {
                this.setState({
                    alerts: this.state.alerts.filter(alert => alert.id !== alertId)
                });
            }, AppConfig.global.alertTimeout);
        });
    };

    /**
     * Get page
     */
    getPage = () => {
        Helpers.Api.expressRequest(
            `${AppConfig.api.baseUrl}/api/page/${this.props.match.params.slug}`,
            'GET'
        ).then(result => {

            if (!result) {
                this.props.history.push('/error');
            }

            // results go to state so they can be displayed (unless on initial load)
            this.setState({
                page: result || {}
            });

        }).catch(() => {

            // show friendly alert
            this.setAlert(AlertTypes.ERROR, AlertTexts.GENERAL);
        });
    };

    render() {
        return (
            <Fragment>
                { this.state.alerts.map((alert, index) => <Alert key={ `alert-${index}` } alert={ alert }/> )}
                <div className="wrapper" id="wrapper">

                    <Hero>
                        <Navigation
                            navMainFixed={ this.state.navMainFixed }
                            active={ this.props.match.params.slug === 'about-me' ? 'ABOUT_ME' : null }
                        />
                    </Hero>

                    { this.state.page ? <main className={ 'content' } id="content">
                        <PageHeader title={ this.state.page.title } />
                        <AutoColumns content={ this.state.page.description } />
                    </main> : null }

                    <Footer />

                </div>
            </Fragment>
        );
    }
}

export default Page;
