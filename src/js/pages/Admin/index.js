import AppConfig from './../../../../config/App.config.js';
import Helpers from '../../helpers';

import React, { Component } from 'react';
import { v4 as uuidv4 } from 'uuid';

import PageIdentifiers from './constants/PageIdentifiers';
import ErrorTypes from './../../constants/ErrorTypes';
import AlertTypes from '../../constants/AlertTypes';
import AlertTexts from '../../constants/AlertTexts';

import Genres from './components/Genres';
import Generations from './components/Generations';
import Pages from './components/Pages';
import Platforms from './components/Platforms';
import Games from './components/Games';
import Reviews from './components/Reviews';
import Alert from './../../components/Alert/Alert';

import style from './style/admin.scss';

class Index extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activePage: PageIdentifiers.GENRES, // default opened page
            alerts: [], // contains thrown alerts
            authorised: false, // for the admin module, perform authorise check before rendering anything
            accessToken: null // when null, prevents page from rendering
        };
    }

    componentDidMount() {
        this.authenticate();
    }

    /**
     * Saves given alert to state so they can be displayed
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
     * Switch between pages
     * @param {string} page - the requested page
     */
    switchPage = page => {
        this.setState({
            activePage: page
        });
    };

    authenticate = () => {
        Helpers.Api.expressRequest(
            `${AppConfig.api.baseUrl}/authenticate`,
            'GET'
        ).then(result => {
            this.setState({ accessToken: result.accessToken });

        }).catch(errors => {
            switch (errors.message.toUpperCase()) {
            case ErrorTypes.UNAUTHORISED:
                this.setAlert(AlertTypes.ERROR, 'Refresh token expired');
                break;
            default:
                this.setAlert(AlertTypes.ERROR, AlertTexts.GENERAL);
                break;
            }

            // redirect to login with a flag so a friendly error message can be displayed
            document.location.href = '/login?unauthorised'
        });
    };

    logout = () => {
        Helpers.Api.expressRequest(
            `${AppConfig.api.baseUrl}/logout`,
            'POST'
        ).then(() => {
            this.setState({ accessToken: null });
            document.location.href = '/login?loggedout';
        }).catch(() => {
            // could not logout
        });
    };

    render() {
        document.title = 'Admin area';

        let pageContent = null;

        if (!this.state.accessToken) {
            return null;
        }

        switch (this.state.activePage) {
        case PageIdentifiers.GENRES:
            pageContent = <Genres
                setAlert={ this.setAlert }
            />;
            break;
        case PageIdentifiers.GENERATIONS:
            pageContent = <Generations
                setAlert={ this.setAlert }
            />;
            break;
        case PageIdentifiers.PAGES:
            pageContent = <Pages
                setAlert={ this.setAlert }
            />;
            break;
        case PageIdentifiers.PLATFORMS:
            pageContent = <Platforms
                setAlert={ this.setAlert }
            />;
            break;
        case PageIdentifiers.GAMES:
            pageContent = <Games
                setAlert={ this.setAlert }
            />;
            break;
        case PageIdentifiers.REVIEWS:
            pageContent = <Reviews
                setAlert={ this.setAlert }
            />;
            break;
        default:
            break;
        }

        return (
            <div className={ style.admin__wrapper }>
                { this.state.alerts.map((alert, index) => <Alert key={ `alert-${index}` } alert={ alert }/> )}
                <header>
                    <h1>Admin area</h1>
                    <button
                        className={ `button ${style.button}`}
                        onClick={ event => {
                            event.preventDefault();
                            this.logout();
                        }}
                    >Log out</button>
                </header>
                <nav>
                    <ul>
                        <li
                            className={ this.state.activePage === PageIdentifiers.GENRES ? style.active : null }
                            onClick={ () => {
                                this.switchPage(PageIdentifiers.GENRES);
                            }}>
                            Genres
                        </li>
                        <li
                            className={ this.state.activePage === PageIdentifiers.GENERATIONS ? style.active : null }
                            onClick={ () => {
                                this.switchPage(PageIdentifiers.GENERATIONS);
                            }}>
                            Generations
                        </li>
                        <li
                            className={ this.state.activePage === PageIdentifiers.PAGES ? style.active : null }
                            onClick={ () => {
                                this.switchPage(PageIdentifiers.PAGES);
                            }}>
                            Pages
                        </li>
                        <li
                            className={ this.state.activePage === PageIdentifiers.PLATFORMS ? style.active : null }
                            onClick={ () => {
                                this.switchPage(PageIdentifiers.PLATFORMS);
                            }}>
                            Platforms
                        </li>
                        <li
                            className={ this.state.activePage === PageIdentifiers.GAMES ? style.active : null }
                            onClick={ () => {
                                this.switchPage(PageIdentifiers.GAMES);
                            }}>
                            Games
                        </li>
                        <li
                            className={ this.state.activePage === PageIdentifiers.REVIEWS ? style.active : null }
                            onClick={ () => {
                                this.switchPage(PageIdentifiers.REVIEWS);
                            }}>
                            Reviews
                        </li>
                    </ul>
                </nav>
                <main>
                    { pageContent }
                </main>
            </div>
        );
    }
}

export default Index;
