import AppConfig from './../../../../config/App.config.js';
import Helpers from './../../helpers/index.js';

import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import AlertTypes from './../../constants/AlertTypes';
import AlertTexts from './../../constants/AlertTexts';

import Alert from './../../components/Alert/Alert';
import Hero from './../../components/Hero';
import Navigation from './../../components/Navigation';
import PageHeader from './../../components/PageHeader';
import InlinePage from './../../components/InlinePage';
import AutoColumns from '../../components/AutoColumns';
import Footer from './../../components/Footer';

import style from './style/games.scss';
import MaterialIcon from './../../components/MaterialIcon';

class Games extends Component {
    constructor(props) {
        super(props);

        this.state = {
            games: [],
            game: {},
            alerts: [],
            navMainFixed: false
        };
    }

    componentDidMount() {
        window.addEventListener('scroll', event => {
            this.scrollHandler(event);
        }, true);

        if (!this.props.match.params.slug) {

            // user is on the /games landing page, retrieve all games
            this.getGames();
        } else {

            // user requests a specific game, retrieve its data
            this.getGame(this.props.match.params.slug);
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
     * Get games
     */
    getGames = () => {
        Helpers.Api.expressRequest(
            `${AppConfig.api.baseUrl}/api/games`,
            'GET'
        ).then(result => {

            // results go to state so they can be displayed (unless on initial load)
            this.setState({
                games: result || []
            });

        }).catch(() => {

            // show friendly alert
            this.setAlert(AlertTypes.ERROR, AlertTexts.GENERAL);
        });
    };

    /**
     * Get specific data for single game
     */
    getGame = slug => {
        Helpers.Api.expressRequest(
            `${AppConfig.api.baseUrl}/api/games/${slug}`,
            'GET'
        ).then(result => {

            if (!result) {
                this.props.history.push('/error');
            }

            // results go to state so they can be displayed, and also store the slug
            this.setState({
                game: result || {},
                genre: result.genre || {}
            });

        }).catch(() => {

            // show friendly alert
            this.setAlert(AlertTypes.ERROR, AlertTexts.GENERAL);
        });
    };

    render() {
        let games = null;
        let game = null;

        if (this.state.games) {
            games = <nav>
                <ul>
                    { this.state.games.map(game =>
                        <li key={ `game-${game.id}` }>
                            <Link
                                to={ `/games/${game.slug}` }
                            >{ game.title }</Link>
                        </li>
                    )}
                </ul>
            </nav>;
        }

        if (this.state.game && this.props.match.params.slug) {
            game = <Fragment>
                <aside className={ style.facts }>
                    <ul>
                        <li key={ 'released' }><strong>Released</strong>{ this.state.game.released || '' }</li>
                        <li key={ 'technology' }><strong>Technology</strong>{ this.state.game.technology || '' }</li>
                        <li key={ 'genre' }><strong>Genre</strong>{ this.state.genre ? this.state.genre.title : '' }</li>
                    </ul>
                </aside>
                <AutoColumns content={ this.state.game.description }/>
            </Fragment>;
        }

        return (
            <Fragment>
                { this.state.alerts.map((alert, index) => <Alert key={ `alert-${index}` } alert={ alert }/> )}
                <div className="wrapper" id="wrapper">

                    <Hero>
                        <Navigation navMainFixed={ this.state.navMainFixed } active={ 'GAMES' } />
                    </Hero>

                    <main className="content" id="content">

                        { this.props.match.params.slug
                            ? <PageHeader title={ this.state.game.id ? this.state.game.title : 'My games' }>
                                <Link
                                    className={ style.backToOverview }
                                    to={ '/games' }
                                >
                                    <MaterialIcon icon={ 'keyboard_arrow_left' } classes={{ iconStyle: style.iconStyle }} />
                                    Back to overview
                                </Link>
                            </PageHeader>
                            : <Fragment><PageHeader title={ 'My games' } />
                                <InlinePage slug={ 'games-introduction' } />
                            </Fragment>
                        }

                        { games }

                        { game }

                        <br /><br />

                        { this.props.match.params.slug
                            ? <Link
                                className={ style.backToOverview }
                                to={ '/games' }
                                onClick={ () => {
                                    this.setState({
                                        game: {}
                                    } );
                                }}
                            >
                                <MaterialIcon icon={ 'keyboard_arrow_left' } classes={{ iconStyle: style.iconStyle }} />
                                Back to overview
                            </Link>
                            : null
                        }

                    </main>

                    <Footer />

                </div>
            </Fragment>
        );
    }
}

export default Games;
