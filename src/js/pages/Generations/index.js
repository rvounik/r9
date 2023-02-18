import AppConfig from './../../../../config/App.config.js';
import Helpers from './../../helpers/index.js';

import React, { Component, Fragment } from 'react';
import { v4 as uuidv4 } from 'uuid';

import AlertTypes from './../../constants/AlertTypes';
import AlertTexts from '../../constants/AlertTexts';

import Alert from '../../components/Alert/Alert';
import Hero from './../../components/Hero';
import Navigation from './../../components/Navigation';
import PageHeader from './../../components/PageHeader';
import Footer from './../../components/Footer';

import style from './style/generations.scss';

class Generations extends Component {
    constructor(props) {
        super(props);

        this.state = {
            alerts: [],
            navMainFixed: false,
            generation: {},
            generations: [],
            platforms: []
        };
    }

    componentDidMount() {
        window.addEventListener('scroll', event => {
            this.scrollHandler(event);
        }, true);

        if (this.props.match.params.slug) {
            this.getGeneration(this.props.match.params.slug);
        } else {
            this.getGenerations();
        }
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
     * Get specific data for single generation and fetch its associated platforms
     */
    getGeneration = slug => {
        Helpers.Api.expressRequest(
            `${AppConfig.api.baseUrl}/api/generations/${slug}`,
            'GET'
        ).then(result => {

            if (!result) {
                this.props.history.push('/error');
            }

            // results go to state so they can be displayed (unless on initial load)
            this.setState({
                generation: result || {}
            }, () => {

                // fetch its associated platforms (first fetch the id)
                const generationId = result.id; //this.state.generations.filter(generation => generation.slug === this.props.match.params.slug)[0].id;

                this.getPlatformsForGeneration(generationId);

            });

        }).catch(() => {

            // show friendly alert
            this.setAlert(AlertTypes.ERROR, AlertTexts.GENERAL);
        });
    };

    /**
     * Get global data for all generations
     */
    getGenerations = () => {
        Helpers.Api.expressRequest(
            `${AppConfig.api.baseUrl}/api/generations`,
            'GET'
        ).then(result => {

            // results go to state so they can be displayed (unless on initial load)
            this.setState({
                generations: result || []
            });

        }).catch(() => {

            // show friendly alert
            this.setAlert(AlertTypes.ERROR, AlertTexts.GENERAL);
        });
    };

    /**
     * Get platforms for given generation id
     */
    getPlatformsForGeneration = generationId => {
        Helpers.Api.expressRequest(
            `${AppConfig.api.baseUrl}/api/platforms${generationId ? '?selectedGeneration=' + generationId : ''}`,
            'GET'
        ).then(result => {
            this.setState({
                platforms: result || []
            });
        }).catch(() => {

            // show friendly alert
            this.setAlert(AlertTypes.ERROR, AlertTexts.GENERAL);
        });
    };

    render() {
        let generationOutput;

        // return all generations
        if (this.state.generations.length) {
            generationOutput = this.state.generations.map(generation =>
                <Fragment key={ `generation-${generation.id}` }>
                    <h3>{ generation.title }</h3>
                    <span>{ generation.yearStart } - { generation.yearEnd }</span>
                    <p dangerouslySetInnerHTML={{ __html: generation.description }}/>
                    <a href={ `/generations/${generation.slug}` } className={ style.generationLink } rel="noopener">
                        Click here to view the platforms from this generation
                    </a>
                    <br />
                    <br />
                </Fragment>
            );
        } else {

            // return a single generation
            generationOutput = <Fragment key={ `generation-${this.state.generation.id}` }>
                <h3>{ this.state.generation.title }</h3>
                <span>{ this.state.generation.yearStart } - { this.state.generation.yearEnd }</span>
                <p dangerouslySetInnerHTML={{ __html: this.state.generation.description }}/>
                <a href={ '/generations' } rel="noreferrer" className={ style.generationLink }>
                    Click here to view all generations
                </a>
                <br />
                <br />
            </Fragment>;
        }

        return (
            <Fragment>
                { this.state.alerts.map((alert, index) => <Alert key={ `alert-${index}` } alert={ alert }/> )}
                <div className="wrapper" id="wrapper">

                    <Hero>
                        <Navigation navMainFixed={ this.state.navMainFixed } active={ 'PLATFORMS' } />
                    </Hero>

                    <main className="content" id="content">
                        <PageHeader title={ 'Generations' } />

                        { generationOutput }

                        { this.state.platforms.map(platform =>
                            <Fragment key={ `platform-${platform.id}`}>
                                <a href={ `/platforms/${platform.slug}` } rel="noreferrer">
                                    { platform.title }
                                </a>
                                <br />
                            </Fragment>
                        ) }
                    </main>

                    <Footer />

                </div>
            </Fragment>
        );
    }
}

export default Generations;
