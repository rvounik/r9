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

class Genres extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab: TabIdentifiers.ADD, // default opened tab
            errors: [], // contains form errors
            genres: [], // list of genres to pick from for editing
            genre: {} // the currently loaded genre for editing
        };
    }

    componentDidMount() {
        this.getGenres();
    }

    /**
     * Resets state data linked to form fields
     */
    resetForm = () => {
        this.setState({
            genres: [],
            genre: {}
        });
    };

    /**
     * Get all available genres
     */
    getGenres = () => {
        document.querySelector('form').reset(); // resets the selection

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
     * Get properties for selected genre
     * @param {Object} event - onChange event
     */
    getGenre = event => {
        event.preventDefault();

        // first clear the current genre info from state
        this.setState({
            genre: {}
        });

        Helpers.Api.expressRequest(
            `${AppConfig.api.baseUrl}/api/admin/genres/${event.target.value}`,
            'GET'
        ).then(result => {

            // results go to state so they can be displayed (unless on initial load)
            this.setState({
                genre: result || {}
            });

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

        if (!this.state.genre.title) {
            this.props.setAlert(AlertTypes.ERROR, AlertTexts.VALIDATION);

            return;
        }

        Helpers.Api.expressRequest(
            `${AppConfig.api.baseUrl}/api/admin/genres`,
            'POST',
            JSON.stringify(
                {
                    ...this.state.genre,
                    slug: slugify(this.state.genre.title.toLowerCase())
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

            // reload genres in case something was changed
            this.getGenres();

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
            `${AppConfig.api.baseUrl}/api/admin/genres/${this.state.genre.id}`,
            'PUT',
            JSON.stringify(this.state.genre)
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

            // reload genres in case something was changed
            this.getGenres();

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
            `${AppConfig.api.baseUrl}/api/admin/genres/${this.state.genre.id}`,
            'DELETE'
        ).then(result => {

            if (result === 0) {
                throw new Error(ErrorTypes.NOT_FOUND);
            }

            // show friendly alert
            this.props.setAlert(AlertTypes.MESSAGE, `${AlertTexts.DELETED}`);

            this.resetForm();

            // reload genres in case something was changed
            this.getGenres();

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
                <label htmlFor="select_genre">Select genre</label>
                <select
                    name="select_genre"
                    onChange={ event => {
                        this.setState({
                            errors: []
                        }, () => {
                            this.getGenre(event);
                        });
                    }}
                    defaultValue="make_selection"
                >
                    <option disabled="disabled" value="make_selection">Select genre</option>
                    { this.state.genres.map((genre, index) =>
                        <option key={ `genre-${index}` } value={ genre.id }>{ genre.title }</option>
                    ) }
                </select>
                <br />
            </Fragment>;
        }

        return (
            <Fragment>
                <h3>Genres</h3><br/>
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
                        this.getGenres();
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
                        value={ this.state.genre.title || '' }
                        onChange={ event=> {
                            this.setState({
                                genre: {
                                    ...this.state.genre,
                                    title: event.target.value
                                }
                            });
                        }}
                        disabled={ this.state.activeTab === TabIdentifiers.EDIT && !this.state.genre.id }
                        className={ this.state.errors.filter(error => error.field === 'title')[0] ? 'error' : '' }
                    />
                    <br/>
                    <label htmlFor="description">Description</label>
                    <CKEditor
                        editor={ Editor }
                        config={{
                            ...AppConfig.ckEditorConfiguration,
                            extraPlugins: [ Helpers.ExpressImageUploader ]
                        }}
                        data={ this.state.genre.description || '' }
                        onChange={ ( event, editor ) => {
                            const data = editor.getData();

                            this.setState({
                                genre: {
                                    ...this.state.genre,
                                    description: data
                                }
                            });
                        } }
                    />
                    <br/>
                    <button
                        type="submit"
                        disabled={ this.state.activeTab === TabIdentifiers.EDIT && !this.state.genre.id }
                    >{ this.state.activeTab === TabIdentifiers.ADD ? 'Add item' : 'Update item' }</button>
                    { this.state.activeTab === TabIdentifiers.EDIT ?
                        <button
                            className="danger"
                            onClick={ event => {
                                if (window.confirm('Are you sure you want to delete this item?')) {
                                    this.deleteItem(event);
                                }
                            } }
                            disabled={ !this.state.genre.id }
                        >Delete item</button> : null }
                </form>
            </Fragment>
        );
    }
}

export default Genres;
