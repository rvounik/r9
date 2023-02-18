import React, { Fragment, Component } from 'react';
import ReactDOM from 'react-dom';
import { Redirect } from 'react-router';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Helpers from './helpers/index.js';

// import global scss so it becomes available in all modules (without it, webpack will never parse global css)
import style from './../css/index.scss'; // eslint-disable-line no-unused-vars

/**
 * Returns the given page asynchronously
 * @param {string} page - page component to import
 * @param {Object} props - props to forward
 * @returns {any | Promise | * | PromiseLike<T> | Promise<T>} page
 */
const getComponent = (page, props = {}) => Helpers.AsyncComponent(() => import(`./pages/${page}`), props);

/**
 * Renders the app
 * @returns {{}} app
 */
class App extends Component {
    render() {
        return (
            <section id="layout">
                <Router>
                    <Fragment>
                        <Switch>

                            { /* app default route */ }
                            <Route exact path="/" render={ () => <Redirect to="/page/about-me"/> } />

                            <Route path="/generations/:slug" component={ getComponent('Generations') } />
                            <Route path="/generations" component={ getComponent('Generations') } />

                            <Route path="/platforms/:slug" component={ getComponent('Platforms') } />
                            <Route path="/platforms" component={ getComponent('Platforms') } />

                            <Route path="/games/:slug" component={ getComponent('Games') } />
                            <Route path="/games" component={ getComponent('Games') } />

                            <Route path="/reviews/:platform/:slug" component={ getComponent('Reviews') } />
                            <Route path="/reviews/:platform" component={ getComponent('Reviews') } />
                            <Route path="/reviews" component={ getComponent('Reviews') } />

                            <Route path="/page/:slug" component={ getComponent('Page') } />

                            <Route path="/login" component={ getComponent('Login') } />
                            <Route path="/register" component={ getComponent('Register') } />
                            <Route path="/admin" component={ getComponent('Admin') } />

                            { /* if no  match could be made for requested route, show error page */ }
                            <Route component={ getComponent('Error') } />
                        </Switch>
                    </Fragment>
                </Router>
            </section>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('app')
);
