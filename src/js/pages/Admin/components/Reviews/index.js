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

class Reviews extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab: TabIdentifiers.ADD, // default opened tab
            errors: [], // contains form errors
            platforms: [], // list of platforms to pick from
            genres: [], // list of genres to pick from
            reviews: [], // list of platforms to pick from for editing
            review: {} // the currently loaded platform for editing
        };
    }

    componentDidMount() {

        // todo: use defer
        this.getPlatforms();
        this.getGenres();
        this.getReviews();
    }

    /**
     * Resets state data linked to form fields
     */
    resetForm = () => {
        this.setState({
            reviews: [],
            review: {}
        });
    };

    /**
     * Get all available platforms
     */
    getPlatforms = () => {
        document.querySelector('form').reset(); // resets the selection

        Helpers.Api.expressRequest(
            `${AppConfig.api.baseUrl}/api/admin/platforms`,
            'GET'
        ).then(result => {

            // results go to state so they can be displayed
            this.setState({
                platforms: result
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
     * Get all available reviews
     */
    getReviews = () => {
        document.querySelector('form').reset(); // resets the selection

        Helpers.Api.expressRequest(
            `${AppConfig.api.baseUrl}/api/admin/reviews`,
            'GET'
        ).then(result => {

            // results go to state so they can be displayed
            this.setState({
                reviews: result
            });

        }).catch(() => {

            // show friendly alert
            this.props.setAlert(AlertTypes.ERROR, AlertTexts.GENERAL);
        });
    };

    /**
     * Get properties for selected review
     * @param {Object} event - onChange event
     */
    getReview = event => {
        event.preventDefault();

        // first clear the current platform info from state
        this.setState({
            review: {}
        });

        Helpers.Api.expressRequest(
            `${AppConfig.api.baseUrl}/api/admin/reviews/${event.target.value}`,
            'GET'
        ).then(result => {

            // results go to state so they can be displayed (unless on initial load)
            this.setState({
                review: result || {}
            });

            // select the right genre from the select field
            if (result.genreId) {
                document.querySelector('#genre').value = result.genreId;
            }

            // select the right platform from the select field
            if (result.platformId) {
                document.querySelector('#platform').value = result.platformId;
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

        if (!this.state.review.title) {
            this.props.setAlert(AlertTypes.ERROR, AlertTexts.VALIDATION);

            return;
        }

        // note that a slug is constructed from the title and added transparently
        Helpers.Api.expressRequest(
            `${AppConfig.api.baseUrl}/api/admin/reviews`,
            'POST',
            JSON.stringify(
                {
                    ...this.state.review,
                    slug: slugify(this.state.review.title.toLowerCase())
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

            // reload platforms in case something was changed
            this.getReviews();

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
            `${AppConfig.api.baseUrl}/api/admin/reviews/${this.state.review.id}`,
            'PUT',
            JSON.stringify(this.state.review)
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

            // reload reviews in case something was changed
            this.getReviews();

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
            `${AppConfig.api.baseUrl}/api/admin/reviews/${this.state.review.id}`,
            'DELETE'
        ).then(result => {

            if (result === 0) {
                throw new Error(ErrorTypes.NOT_FOUND);
            }

            // show friendly alert
            this.props.setAlert(AlertTypes.MESSAGE, `${AlertTexts.DELETED}`);

            this.resetForm();

            // reload platforms in case something was changed
            this.getReviews();

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
                <label htmlFor="select_platform">Select review</label>
                <select
                    name="select_review"
                    onChange={ event => {
                        this.setState({
                            errors: []
                        }, () => {
                            this.getReview(event);
                        });
                    }}
                    defaultValue="make_selection"
                >
                    <option disabled="disabled" value="make_selection">Select review</option>
                    { this.state.reviews.map((review, index) =>
                        <option key={ `review-${index}` } value={ review.id }>{ review.title }</option>
                    ) }
                </select>
                <br />
            </Fragment>;
        }

        return (
            <Fragment>
                <h3>Reviews</h3><br/>
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
                        this.getReviews();
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
                        value={ this.state.review.title || '' }
                        onChange={ event=> {
                            this.setState({
                                review: {
                                    ...this.state.review,
                                    title: event.target.value
                                }
                            });
                        }}
                        disabled={ this.state.activeTab === TabIdentifiers.EDIT && !this.state.review.id }
                        className={ this.state.errors.filter(error => error.field === 'title')[0] ? 'error' : '' }
                    />
                    <br/>
                    <label htmlFor="title">Score</label>
                    <input
                        type="number"
                        id="score"
                        name="score"
                        value={ this.state.review.score || '' }
                        onChange={ event=> {
                            this.setState({
                                review: {
                                    ...this.state.review,
                                    score: event.target.value
                                }
                            });
                        }}
                        disabled={ this.state.activeTab === TabIdentifiers.EDIT && !this.state.review.id }
                        className={ this.state.errors.filter(error => error.field === 'score')[0] ? 'error' : '' }
                    />
                    <br/>
                    <label htmlFor="title">Released</label>
                    <input
                        type="number"
                        id="released"
                        name="released"
                        value={ this.state.review.released || '' }
                        onChange={ event=> {
                            this.setState({
                                review: {
                                    ...this.state.review,
                                    released: event.target.value
                                }
                            });
                        }}
                        disabled={ this.state.activeTab === TabIdentifiers.EDIT && !this.state.review.id }
                        className={ this.state.errors.filter(error => error.field === 'released')[0] ? 'error' : '' }
                    />
                    <br/>
                    <label htmlFor="select_platform">Select platform</label>
                    <select
                        name="platform"
                        id="platform"
                        onChange={ event => {
                            this.setState({
                                review: {
                                    ...this.state.review,
                                    platformId: event.target.value
                                }
                            });
                        }}
                        defaultValue={ this.state.review.platformId || 'make_selection' }
                        disabled={ this.state.activeTab === TabIdentifiers.EDIT && !this.state.review.id }
                    >
                        <option disabled="disabled" value="make_selection">Select Platform</option>
                        { this.state.platforms.map((platform, index) =>
                            <option key={ `platform-${index}` } value={ platform.id }>{ platform.title }</option>
                        ) }
                    </select>
                    <br/>
                    <label htmlFor="select_genre">Select genre</label>
                    <select
                        name="genre"
                        id="genre"
                        onChange={ event => {
                            this.setState({
                                review: {
                                    ...this.state.review,
                                    genreId: event.target.value
                                }
                            });
                        }}
                        defaultValue={ this.state.review.genreId || 'make_selection' }
                        disabled={ this.state.activeTab === TabIdentifiers.EDIT && !this.state.review.id }
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
                        data={ this.state.review.description || '' }
                        onChange={ ( event, editor ) => {
                            const data = editor.getData();

                            this.setState({
                                review: {
                                    ...this.state.review,
                                    description: data
                                }
                            });
                        } }
                    />
                    <br/>
                    <button
                        type="submit"
                        disabled={ this.state.activeTab === TabIdentifiers.EDIT && !this.state.review.id }
                    >{ this.state.activeTab === TabIdentifiers.ADD ? 'Add item' : 'Update item' }</button>
                    { this.state.activeTab === TabIdentifiers.EDIT ?
                        <button
                            className="danger"
                            onClick={ event => {
                                if (window.confirm('Are you sure you want to delete this item?')) {
                                    this.deleteItem(event);
                                }
                            } }
                            disabled={ !this.state.review.id }
                        >Delete item</button> : null }
                </form>
            </Fragment>
        );
    }
}

export default Reviews;
