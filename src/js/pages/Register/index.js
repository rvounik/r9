import AppConfig from './../../../../config/App.config.js';
import Helpers from './../../helpers/index.js';

import React, {Component} from 'react';

class Register extends Component {
    constructor(props) {
        super(props);
    }

    register(event) {
        event.preventDefault();

        if (!event.target.email.value || !event.target.password.value) {
            console.log('fill in all fields')
        } else {
            Helpers.Api.expressRequest(
                `${AppConfig.api.baseUrl}/register`,
                'POST',
                JSON.stringify(
                    {
                        email: event.target.email.value,
                        password: event.target.password.value
                    })
            ).then(result => {

                // todo: use alerts
                if (!result) {
                    console.log('register failed')
                } else {
                    console.log('register success')
                }
            }).catch(error => {
                console.log(error)
            })
        }
    }

    render() {
        return (
            <div>
                <h1>Register</h1>
                <form id="signin" name="signin" method="post" action="/register" onSubmit={ event => { this.register(event) } }>
                    <label htmlFor="email">Email address</label>

                    {/*todo: make it an email field eventually*/}
                    <input type="text" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" name="email" />
                    <label htmlFor="password">Password</label>
                    <input type="password" className="form-control" id="exampleInputPassword1" placeholder="Password" name="password" />
                    <button type="submit" className="btn btn-primary">Submit</button>
                </form>
            </div>
        )
    }
}

export default Register;
