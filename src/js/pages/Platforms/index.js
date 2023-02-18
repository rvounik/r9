import AppConfig from './../../../../config/App.config.js';
import Helpers from './../../helpers/index.js';

import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import AlertTypes from './../../constants/AlertTypes';
import AlertTexts from './../../constants/AlertTexts';

import Alert from '../../components/Alert/Alert';
import Hero from './../../components/Hero';
import Navigation from './../../components/Navigation';
import PageHeader from './../../components/PageHeader';
import SelectGeneration from './../../components/SelectGeneration';
import AutoColumns from '../../components/AutoColumns';
import Footer from './../../components/Footer';

import style from './style/platforms.scss';

class Platforms extends Component {
    constructor(props) {
        super(props);

        this.state = {
            platforms: [],
            platform: null,
            generations: [],
            selectedGeneration: null,
            alerts: [],
            navMainFixed: false
        };
    }

    componentDidMount() {
        window.addEventListener('scroll', event => {
            this.scrollHandler(event);
        }, true);

        if (!this.props.match.params.slug) {

            // user is on the /platforms landing page, retrieve all platforms
            this.getPlatforms();
        } else {

            // user requests a specific platform, retrieve its data then fetch all related platforms
            this.getPlatform(this.props.match.params.slug);
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
     * Get generations
     */
    getGenerations = () => {
        Helpers.Api.expressRequest(
            `${AppConfig.api.baseUrl}/api/generations`,
            'GET'
        ).then(result => {

            // results go to state so they can be displayed (unless on initial load)
            this.setState({
                generations: result || []
            }, () => {
                if (this.state.selectedGeneration) {
                    document.querySelector('#select_generation').value = this.state.selectedGeneration;
                }
            });

        }).catch(() => {

            // show friendly alert
            this.setAlert(AlertTypes.ERROR, AlertTexts.GENERAL);
        });
    };

    /**
     * Get global data for all platforms
     */
    getPlatforms = generationId => {
        Helpers.Api.expressRequest(
            `${AppConfig.api.baseUrl}/api/platforms${generationId ? '?selectedGeneration=' + generationId : ''}`,
            'GET'
        ).then(result => {

            if (!this.props.match.params.slug) {

                // no slug in url: this is probably the landing page. redirect to last added platform
                result = result.sort(function(a, b){
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });

                // todo: would be nice to add a property so that an info modal can be shown on first land
                this.props.history.push(`/platforms/${result[0].slug}`);
            } else {
                this.setState({
                    platforms: result || []
                });
            }

        }).catch(() => {

            // show friendly alert
            this.setAlert(AlertTypes.ERROR, AlertTexts.GENERAL);
        });
    };

    /**
     * Get specific data for single platform
     */
    getPlatform = slug => {
        Helpers.Api.expressRequest(
            `${AppConfig.api.baseUrl}/api/platforms/${slug}`,
            'GET'
        ).then(result => {

            if (!result) {
                this.props.history.push('/error');
            }

            // results go to state so they can be displayed, and also store the slug
            this.setState({
                platform: result || {},
                selectedGeneration: result.generation ? result.generation.slug : null
            }, () => {

                // now that the platform data is in, the related platforms from this generation can be fetched
                this.getPlatforms(result.generationId || null);

                // also fetch generations for populating the selectGeneration list
                this.getGenerations();
            });

        }).catch(() => {

            // show friendly alert
            this.setAlert(AlertTypes.ERROR, AlertTexts.GENERAL);
        });
    };

    /**
     * onChange handler for selectGeneration component
     */
    changeGeneration = event => {
        this.props.history.push(`/generations/${event.target.value}`);
    };

    render() {
        let platform = null;

        if (this.state.platform) {
            const metaDataIds = ['manufacturer', 'introduced', 'technology'];

            // todo: finish when reviews are in
            const gameDataIds = ['game1', 'game2', 'game3', 'game4', 'game5'];
            const linkedGames = [];

            gameDataIds.map(id => {
                if (this.state.platform[id]) {
                    linkedGames.push(<a href={this.state.platform[id]}>{ this.state.platform[id] }</a>);
                }
            });

            platform = <Fragment>
                <aside className={ style.facts }>
                    <ul>
                        { metaDataIds.map(id => {
                            if (this.state.platform[id]) {
                                return <li key={ id }><strong>{ id }</strong>{ this.state.platform[id] || '' }</li>;
                            }
                        })}
                        { linkedGames.length ? <li><strong>Noteworthy games</strong>{ linkedGames }</li> : null }
                    </ul>
                </aside>
                <AutoColumns content={ this.state.platform.description }/>
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
                        <PageHeader title={ this.state.platform ? this.state.platform.title : '' }>
                            <SelectGeneration
                                onChange={ this.changeGeneration }
                                generations={ this.state.generations }
                                selectedGeneration={ this.state.selectedGeneration }
                            />
                        </PageHeader>

                        { platform }

                        { this.state.platforms.length ?
                            <nav className={ style.relatedContent }>
                                <h4>More platforms from this generation:</h4>
                                <ul>
                                    { this.state.platforms.map(platform => {
                                        if (platform.slug !== this.props.match.params.slug) {
                                            return <li key={ `platform-${platform.id}` }>
                                                <Link
                                                    to={ `/platforms/${platform.slug}` }
                                                    onClick={ () => {
                                                        this.getPlatform(platform.slug);
                                                    } }
                                                >{ platform.title }</Link>
                                            </li>;
                                        }
                                    }
                                    )}
                                </ul>
                            </nav> : null }
                    </main>

                    <Footer />

                </div>
            </Fragment>
        );
    }
}

export default Platforms;
