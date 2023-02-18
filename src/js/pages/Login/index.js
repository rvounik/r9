import React, { Component, Fragment } from 'react';
import { v4 as uuidv4 } from 'uuid';

import AppConfig from './../../../../config/App.config.js';
import Helpers from './../../helpers/index.js';

import AlertTypes from './../../constants/AlertTypes';
import ErrorTypes from './../../constants/ErrorTypes';
import AlertTexts from './../../constants/AlertTexts';

import Alert from './../../components/Alert/Alert';

class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            alerts: []
        };
    }

    componentDidMount() {
        const urlParams = new URLSearchParams(window.location.search);

        // todo: extract to constants
        if (urlParams.has('unauthorised')) {
            this.setAlert(AlertTypes.ERROR, AlertTexts.EXPIRED);
        }

        if (urlParams.has('loggedout')) {
            this.setAlert(AlertTypes.MESSAGE, AlertTexts.LOGGED_OUT);
        }
    }

    login(event) {
        event.preventDefault();

        // note that a slug is constructed from the title and added transparently
        Helpers.Api.expressRequest(
            `${AppConfig.api.baseUrl}${AppConfig.api.routes.login}`,
            'POST',
            JSON.stringify(
                {
                    email: event.target.email.value,
                    password: event.target.password.value
                })
        ).then(result => {
            if (!result) {
                throw new Error(ErrorTypes.UNEXPECTED_RESPONSE);
            }

            if (!result.accessToken) {
                throw new Error(ErrorTypes.UNAUTHORISED);
            }

            // user found, redirect to admin route
            document.location.href = AppConfig.api.routes.admin;
        }).catch(errors => {
            switch (errors.message.toUpperCase()) {
                case ErrorTypes.UNAUTHORISED:
                    this.setAlert(AlertTypes.ERROR, AlertTexts.INVALID_CREDENTIALS);
                    break;
                default:
                    this.setAlert(AlertTypes.ERROR, AlertTexts.GENERAL);
                    break;
            }
        })
    }

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

    render() {
        return (
            <Fragment>
                { this.state.alerts.map((alert, index) => <Alert key={ `alert-${index}` } alert={ alert }/> )}
                <div>
                    <h1>Login</h1>
                    <form id="login" method="post" action="/login" onSubmit={ event => { this.login(event) } }>
                        <label htmlFor="email">Email address</label>
                        <input type="text" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" name="email" />
                        <label htmlFor="password">Password</label>
                        <input type="password" className="form-control" id="exampleInputPassword1" placeholder="Password" name="password" />
                        <button type="submit" className="btn btn-primary">Submit</button>
                    </form>
                </div>
            </Fragment>
        )
    }
}

export default Login;
