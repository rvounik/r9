import AppConfig from './../../../../../../config/App.config.js';
import Helpers from './../../../../helpers/index.js';

import React, { Component, Fragment } from 'react';
import Editor from 'ckeditor5-custom-build/build/ckeditor';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import slugify from 'slugify';

import AlertTypes from './../../../../constants/AlertTypes';
import AlertTexts from './../../../../constants/AlertTexts';
import ErrorTypes from '../../../../constants/ErrorTypes';
import TabIdentifiers from '../../constants/TabIdentifiers';

import Tabs from './../../../../components/Tabs/Tabs';

class Games extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab: TabIdentifiers.ADD, // default opened tab
            errors: [], // contains form errors
            games: [], // list of games to pick from for editing
            game: {}, // the currently loaded game for editing
            genres: [] // list of genres to pick from
        };
    }

    componentDidMount() {

        // todo: use defer
        this.getGames();
        this.getGenres();
    }

    /**
     * Resets state data linked to form fields
     */
    resetForm = () => {
        this.setState({
            games: [],
            game: {}
        });
    };

    /**
     * Get all available games
     */
    getGames = () => {
        document.querySelector('form').reset(); // resets the selection

        // todo: use app config routes instead of writing them here
        Helpers.Api.expressRequest(
            `${AppConfig.api.baseUrl}/api/admin/games`,
            'GET'
        ).then(result => {

            // results go to state so they can be displayed
            this.setState({
                games: result
            });

        }).catch(() => {

            // show friendly alert
            this.props.setAlert(AlertTypes.ERROR, AlertTexts.GENERAL);
        });
    };


    /**
     * Get all available genres
     */
    getGenres = () => {
        document.querySelector('form').reset(); // resets the selection

        // todo: use app config routes instead of writing them here
        Helpers.Api.expressRequest(
            `${AppConfig.api.baseUrl}/api/admin/genres`,
            'GET'
        ).then(result => {

            // results go to state so they can be displayed
            this.setState({
                genres: result
            });
        }).catch(() => {

            // show friendly alert
            this.props.setAlert(AlertTypes.ERROR, AlertTexts.GENERAL);
        });
    };

    /**
     * Get properties for selected game
     * @param {Object} event - onChange event
     */
    getGame = event => {
        event.preventDefault();

        // first clear the current game info from state
        this.setState({
            game: {}
        });

        // todo: use app config routes instead of writing them here
        Helpers.Api.expressRequest(
            `${AppConfig.api.baseUrl}/api/admin/games/${event.target.value}`,
            'GET'
        ).then(result => {

            // results go to state so they can be displayed (unless on initial load)
            this.setState({
                game: result || {}
            });

            // select the right genre from the select field
            if (result.genreId) {
                document.querySelector('#genre').value = result.genreId;
            }

        }).catch(() => {

            // show friendly alert
            this.props.setAlert(AlertTypes.ERROR, AlertTexts.GENERAL);
        });
    };

    /**
     * Add item to database
     * @param {Object} event - click event
     */
    addItem = event => {
        event.preventDefault();

        // clear old errors
        this.setState({
            errors: []
        });

        if (!this.state.game.title) {
            this.props.setAlert(AlertTypes.ERROR, AlertTexts.VALIDATION);

            return;
        }

        // todo: use app config routes instead of writing them here
        // note that a slug is constructed from the title and added transparently
        Helpers.Api.expressRequest(
            `${AppConfig.api.baseUrl}/api/admin/games`,
            'POST',
            JSON.stringify(
                {
                    ...this.state.game,
                    slug: slugify(this.state.game.title.toLowerCase())
                })
        ).then(result => {

            // received a valid response, but with errors. Build up error state using parseErrors to highlight the field(s)
            if (result.errors) {
                this.setState({
                    errors: Helpers.Form.parseErrors(result.errors) || []
                });

                throw new Error(ErrorTypes.VALIDATION_ERROR);
            }

            // show friendly alert
            this.props.setAlert(AlertTypes.MESSAGE, `${AlertTexts.ADDED} ${result.id}`);

            this.resetForm();

            // reload games in case something was changed
            this.getGames();

        }).catch(errors => {
            switch (errors.message.toUpperCase()) {
            case ErrorTypes.UNIQUE_VIOLATION:
                this.props.setAlert(AlertTypes.ERROR, AlertTexts.UNIQUE);
                break;
            case ErrorTypes.VALIDATION_ERROR:
                this.props.setAlert(AlertTypes.ERROR, AlertTexts.VALIDATION);
                break;
            default:
                throw new Error(ErrorTypes.INTERNAL_SERVER_ERROR);
            }
        }).catch(() => {

            // show friendly alert
            this.props.setAlert(AlertTypes.ERROR, AlertTexts.GENERAL);
        });
    };

    /**
     * Update item in database
     * @param {Object} event - click event
     */
    updateItem = event => {
        event.preventDefault();

        // clear old errors
        this.setState({
            errors: []
        });

        Helpers.Api.expressRequest(
            `${AppConfig.api.baseUrl}/api/admin/games/${this.state.game.id}`,
            'PUT',
            JSON.stringify(this.state.game)
        ).then(result => {

            if (result[0] === 0) {
                throw new Error(ErrorTypes.NOT_FOUND);
            }

            // received a valid response, but with errors. Build up error state using parseErrors to highlight the field(s)
            if (result.errors) {
                this.setState({
                    errors: Helpers.Form.parseErrors(result.errors) || []
                });

                throw new Error(ErrorTypes.VALIDATION_ERROR);
            }

            // show friendly alert
            this.props.setAlert(AlertTypes.MESSAGE, `${AlertTexts.UPDATED}`);

            this.resetForm();

            // reload games in case something was changed
            this.getGames();

        }).catch(errors => {
            switch (errors.message.toUpperCase()) {
            case ErrorTypes.UNIQUE_VIOLATION:
                this.props.setAlert(AlertTypes.ERROR, AlertTexts.UNIQUE);
                break;
            case ErrorTypes.VALIDATION_ERROR:
                this.props.setAlert(AlertTypes.ERROR, AlertTexts.VALIDATION);
                break;
            case ErrorTypes.NOT_FOUND:
                this.props.setAlert(AlertTypes.ERROR, AlertTexts.NOT_FOUND);
                break;
            default:
                throw new Error(ErrorTypes.INTERNAL_SERVER_ERROR);
            }
        }).catch(() => {

            // show friendly alert
            this.props.setAlert(AlertTypes.ERROR, AlertTexts.GENERAL);
        });
    };

    /**
     * Delete item from database
     * @param {Object} event - click event
     */
    deleteItem = event => {
        event.preventDefault();

        Helpers.Api.expressRequest(
            `${AppConfig.api.baseUrl}/api/admin/games/${this.state.game.id}`,
            'DELETE'
        ).then(result => {

            if (result === 0) {
                throw new Error(ErrorTypes.NOT_FOUND);
            }

            // show friendly alert
            this.props.setAlert(AlertTypes.MESSAGE, `${AlertTexts.DELETED}`);

            this.resetForm();

            // reload games in case something was changed
            this.getGames();

        }).catch(errors => {
            switch (errors.message.toUpperCase()) {
            case ErrorTypes.NOT_FOUND:
                this.props.setAlert(AlertTypes.ERROR, AlertTexts.NOT_FOUND);
                break;
            default:
                throw new Error(ErrorTypes.INTERNAL_SERVER_ERROR);
            }
        }).catch(() => {

            // show friendly alert
            this.props.setAlert(AlertTypes.ERROR, AlertTexts.GENERAL);
        });
    };

    render() {
        let selectField = null;

        if (this.state.activeTab === TabIdentifiers.EDIT) {
            selectField = <Fragment>
                <label htmlFor="select_game">Select game</label>
                <select
                    name="select_game"
                    onChange={ event => {
                        this.setState({
                            errors: []
                        }, () => {
                            this.getGame(event);
                        });
                    }}
                    defaultValue="make_selection"
                >
                    <option disabled="disabled" value="make_selection">Select game</option>
                    { this.state.games.map((game, index) =>
                        <option key={ `game-${index}` } value={ game.id }>{ game.title }</option>
                    ) }
                </select>
                <br />
            </Fragment>;
        }

        return (
            <Fragment>
                <h3>Games</h3><br/>
                <Tabs
                    tabs={[
                        {
                            id: TabIdentifiers.ADD,
                            title: TabIdentifiers.ADD
                        },
                        {
                            id: TabIdentifiers.EDIT,
                            title: TabIdentifiers.EDIT
                        }
                    ]}
                    onSwitchTab={ tab => {
                        this.setState({
                            activeTab: tab,
                            errors: []
                        });

                        this.resetForm();
                        this.getGames();
                    }}
                    activeTab={ this.state.activeTab }
                />
                <form onSubmit={ event => {
                    this.state.activeTab === TabIdentifiers.ADD
                        ? this.addItem(event)
                        : this.updateItem(event);
                }}
                >
                    { selectField }
                    <label htmlFor="title">Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={ this.state.game.title || '' }
                        onChange={ event=> {
                            this.setState({
                                game: {
                                    ...this.state.game,
                                    title: event.target.value
                                }
                            });
                        }}
                        disabled={ this.state.activeTab === TabIdentifiers.EDIT && !this.state.game.id }
                        className={ this.state.errors.filter(error => error.field === 'title')[0] ? 'error' : '' }
                    />
                    <br/>
                    <label htmlFor="title">Technology</label>
                    <input
                        type="text"
                        id="technology"
                        name="technology"
                        value={ this.state.game.technology || '' }
                        onChange={ event=> {
                            this.setState({
                                game: {
                                    ...this.state.game,
                                    technology: event.target.value
                                }
                            });
                        }}
                        disabled={ this.state.activeTab === TabIdentifiers.EDIT && !this.state.game.id }
                        className={ this.state.errors.filter(error => error.field === 'technology')[0] ? 'error' : '' }
                    />
                    <br/>
                    <label htmlFor="title">Released</label>
                    <input
                        type="text"
                        id="released"
                        name="released"
                        value={ this.state.game.released || '' }
                        onChange={ event=> {
                            this.setState({
                                game: {
                                    ...this.state.game,
                                    released: event.target.value
                                }
                            });
                        }}
                        disabled={ this.state.activeTab === TabIdentifiers.EDIT && !this.state.game.id }
                        className={ this.state.errors.filter(error => error.field === 'released')[0] ? 'error' : '' }
                    />
                    <br/>
                    <label htmlFor="select_generation">Select genre</label>
                    <select
                        name="genre"
                        id="genre"
                        onChange={ event => {
                            this.setState({
                                game: {
                                    ...this.state.game,
                                    genreId: event.target.value
                                }
                            });
                        }}
                        defaultValue={ this.state.game.genreId || 'make_selection' }
                        disabled={ this.state.activeTab === TabIdentifiers.EDIT && !this.state.game.id }
                    >
                        <option disabled="disabled" value="make_selection">Select genre</option>
                        { this.state.genres.map((genre, index) =>
                            <option key={ `genre-${index}` } value={ genre.id }>{ genre.title }</option>
                        ) }
                    </select>

                    <br/>
                    <label htmlFor="description">Description</label>
                    <CKEditor
                        editor={ Editor }
                        config={{
                            ...AppConfig.ckEditorConfiguration,
                            extraPlugins: [ Helpers.ExpressImageUploader ]
                        }}
                        data={ this.state.game.description || '' }
                        onChange={ ( event, editor ) => {
                            const data = editor.getData();

                            this.setState({
                                game: {
                                    ...this.state.game,
                                    description: data
                                }
                            });
                        } }
                    />
                    <br/>
                    <button
                        type="submit"
                        disabled={ this.state.activeTab === TabIdentifiers.EDIT && !this.state.game.id }
                    >{ this.state.activeTab === TabIdentifiers.ADD ? 'Add item' : 'Update item' }</button>
                    { this.state.activeTab === TabIdentifiers.EDIT ?
                        <button
                            className="danger"
                            onClick={ event => {
                                if (window.confirm('Are you sure you want to delete this item?')) {
                                    this.deleteItem(event);
                                }
                            } }
                            disabled={ !this.state.game.id }
                        >Delete item</button> : null }
                </form>
            </Fragment>
        );
    }
}

export default Games;
