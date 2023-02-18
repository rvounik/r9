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
import SelectPlatform from './../../components/SelectPlatform';
import AutoColumns from '../../components/AutoColumns';
import Footer from './../../components/Footer';

import style from './style/reviews.scss';

class Reviews extends Component {
    constructor(props) {
        super(props);

        this.state = {
            reviews: [],
            review: null,
            platforms: [],
            selectedPlatform: null,
            alerts: [],
            navMainFixed: false
        };
    }

    componentDidMount() {
        window.addEventListener('scroll', event => {
            this.scrollHandler(event);
        }, true);

        //
        if (this.props.match.params.slug) {

            // single
            this.getReview(this.props.match.params.slug);
        } else if (this.props.match.params.platform) {

            // all for platform
            this.getReviews({ slug: this.props.match.params.platform });
        } else {

            // all
            this.getPlatforms();

            this.getReviews();
        }
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.scrollHandler, true);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.match.params.slug !== this.props.match.params.slug) {
            this.getReview(this.props.match.params.slug);
        }
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
     * Get global data for all platforms
     */
    getPlatforms = () => {
        Helpers.Api.expressRequest(
                `${AppConfig.api.baseUrl}/api/platforms`,
                'GET'
        ).then(result => {
            this.setState({
                platforms: result || []
            }, () => {
                // let selectedPlatformSlug = null;

                if (this.state.review) {
                    document.querySelector('#select_platform').value = this.state.review.platform.slug;
                }

                // // highlight the right option in the dropdown
                // // todo: isnt this already fetched using the association? in this.state.review.platform.slug?
                // if (this.state.platforms.length && this.state.selectedPlatform) {
                //
                //     console.log(this.state.review.platform.slug)
                //     selectedPlatformSlug = this.state.platforms.filter(platform => platform.id === this.state.selectedPlatform)[0].slug;
                //
                //     document.querySelector('#select_platform').value = selectedPlatformSlug;
                // }
            });

        }).catch(() => {

            // show friendly alert
            this.setAlert(AlertTypes.ERROR, AlertTexts.GENERAL);
        });
    };

    /**
     * Get global data for all reviews
     */
    getReviews = platform => {
        let endPoint = `${AppConfig.api.baseUrl}/api/reviews`;

        if (platform && platform.id) {
            endPoint = `${AppConfig.api.baseUrl}/api/reviews?id=${platform.id}}`;
        }

        if (platform && platform.slug) {
            endPoint = `${AppConfig.api.baseUrl}/api/reviews?slug=${platform.slug}`;
        }

        Helpers.Api.expressRequest(
            endPoint,
            'GET'
        ).then(result => {

            if (!result) {
                return null;
            }

            if (platform) {

                // all reviews for a certain platform were requested. from the sorted results, pick the last one and route to it
                result = result.sort(function(a, b){
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });

                // if a slug was not present, we are at a platform landing page
                if (!this.props.match.params.slug) {

                    // todo: would be nice to add a property so that an info modal can be shown on first land
                    this.props.history.push(`/reviews/${platform.slug}/${result[0].slug}`);
                }
            }

            if (this.state.review) {
                this.setState({
                    reviews: result
                });
            }
        }).catch(() => {

            // show friendly alert
            this.setAlert(AlertTypes.ERROR, AlertTexts.GENERAL);
        });
    };

    /**
     * Get specific data for single review
     */
    getReview = slug => {
        Helpers.Api.expressRequest(
            `${AppConfig.api.baseUrl}/api/reviews/${slug}`,
            'GET'
        ).then(result => {

            if (!result) {
                this.props.history.push('/error');
            }

            // results go to state so they can be displayed, and also store the slug
            this.setState({
                review: result || {},
                selectedPlatform: result.platformId ? result.platformId : null
            }, () => {

                // also fetch platforms for populating the selectPlatform list
                this.getPlatforms();

                // now that the review data is in, the related platforms from this platform can be fetched
                this.getReviews({ slug: this.props.match.params.platform });
            });

        }).catch(() => {

            // show friendly alert
            this.setAlert(AlertTypes.ERROR, AlertTexts.GENERAL);
        });
    };

    /**
     * onChange handler for selectPlatform component
     */
    changePlatform = event => {
        this.props.history.push(`/reviews/${event.target.value}`);
    };

    render() {
        let review = null;

        if (this.state.review) {
            const metaDataIds = ['score', 'released'];

            review = <Fragment>
                <aside className={ style.facts }>
                    <ul>
                        { metaDataIds.map(id => {
                            if (this.state.review[id]) {
                                return <li key={ id }><strong>{ id }</strong>{ this.state.review[id] || '' }</li>;
                            }
                        })}
                    </ul>
                </aside>
                <AutoColumns content={ this.state.review.description }/>
            </Fragment>;
        }

        return (
            <Fragment>
                { this.state.alerts.map((alert, index) => <Alert key={ `alert-${index}` } alert={ alert }/> )}
                <div className="wrapper" id="wrapper">

                    <Hero>
                        <Navigation navMainFixed={ this.state.navMainFixed } active={ 'REVIEWS' } />
                    </Hero>

                    <main className="content" id="content">
                        <PageHeader title={ this.state.review ? this.state.review.title : 'Reviews' }>
                            <SelectPlatform
                                onChange={ this.changePlatform }
                                platforms={ this.state.platforms }
                                selectedPlatform={ this.state.selectedPlatform }
                            />
                        </PageHeader>

                        { review ? review : <p>Please select a platform from the dropdown list on the right.</p> }

                        { this.state.review && this.state.platforms.length && this.state.reviews.length
                            ? <nav className={ style.relatedContent }>
                                <h4>More reviews for this platform:</h4>
                                <ul>
                                    { this.state.reviews.map(review => {
                                        let platformSlug = this.state.platforms.filter(platform => platform.id === review.platformId);

                                        if (platformSlug && platformSlug[0]) {
                                            platformSlug = platformSlug[0].slug;
                                        }

                                        if (review.slug !== this.props.match.params.slug) {
                                            return <li key={ `reviews-${review.id}` }>
                                                <Link
                                                    to={ `/reviews/${platformSlug}/${review.slug}` }
                                                >{ review.title }</Link>
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

export default Reviews;
