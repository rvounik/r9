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

import style from './style/platforms.scss';

class Platforms extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab: TabIdentifiers.ADD, // default opened tab
            errors: [], // contains form errors
            generations: [], // list of generations to pick from
            platforms: [], // list of platforms to pick from for editing
            platform: {} // the currently loaded platform for editing
        };
    }

    componentDidMount() {

        // todo: use defer
        this.getPlatforms();
        this.getGenerations();
    }

    /**
     * Resets state data linked to form fields
     */
    resetForm = () => {
        this.setState({
            platforms: [],
            platform: {}
        });
    };

    /**
     * Get all available generations
     */
    getGenerations = () => {
        document.querySelector('form').reset(); // resets the selection

        Helpers.Api.expressRequest(
            `${AppConfig.api.baseUrl}/api/admin/generations`,
            'GET'
        ).then(result => {

            // results go to state so they can be displayed
            this.setState({
                generations: result
            });

        }).catch(() => {

            // show friendly alert
            this.props.setAlert(AlertTypes.ERROR, AlertTexts.GENERAL);
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
     * Get properties for selected platform
     * @param {Object} event - onChange event
     */
    getPlatform = event => {
        event.preventDefault();

        // first clear the current platform info from state
        this.setState({
            platform: {}
        });

        Helpers.Api.expressRequest(
            `${AppConfig.api.baseUrl}/api/admin/platforms/${event.target.value}`,
            'GET'
        ).then(result => {

            // results go to state so they can be displayed (unless on initial load)
            this.setState({
                platform: result || {}
            });

            // select the right generation from the select field
            if (result.generationId) {
                document.querySelector('#generation').value = result.generationId;
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

        if (!this.state.platform.title) {
            this.props.setAlert(AlertTypes.ERROR, AlertTexts.VALIDATION);

            return;
        }

        // note that a slug is constructed from the title and added transparently
        Helpers.Api.expressRequest(
            `${AppConfig.api.baseUrl}/api/admin/platforms`,
            'POST',
            JSON.stringify(
                {
                    ...this.state.platform,
                    slug: slugify(this.state.platform.title.toLowerCase())
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
            this.getPlatforms();

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
            `${AppConfig.api.baseUrl}/api/admin/platforms/${this.state.platform.id}`,
            'PUT',
            JSON.stringify(this.state.platform)
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

            // reload platforms in case something was changed
            this.getPlatforms();

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
            `${AppConfig.api.baseUrl}/api/admin/platforms/${this.state.platform.id}`,
            'DELETE'
        ).then(result => {

            if (result === 0) {
                throw new Error(ErrorTypes.NOT_FOUND);
            }

            // show friendly alert
            this.props.setAlert(AlertTypes.MESSAGE, `${AlertTexts.DELETED}`);

            this.resetForm();

            // reload platforms in case something was changed
            this.getPlatforms();

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
                <label htmlFor="select_platform">Select platform</label>
                <select
                    name="select_platform"
                    onChange={ event => {
                        this.setState({
                            errors: []
                        }, () => {
                            this.getPlatform(event);
                        });
                    }}
                    defaultValue="make_selection"
                >
                    <option disabled="disabled" value="make_selection">Select platform</option>
                    { this.state.platforms.map((platform, index) =>
                        <option key={ `platform-${index}` } value={ platform.id }>{ platform.title }</option>
                    ) }
                </select>
                <br />
            </Fragment>;
        }

        return (
            <Fragment>
                <h3>Platforms</h3><br/>
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
                        this.getPlatforms();
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
                        value={ this.state.platform.title || '' }
                        onChange={ event=> {
                            this.setState({
                                platform: {
                                    ...this.state.platform,
                                    title: event.target.value
                                }
                            });
                        }}
                        disabled={ this.state.activeTab === TabIdentifiers.EDIT && !this.state.platform.id }
                        className={ this.state.errors.filter(error => error.field === 'title')[0] ? 'error' : '' }
                    />
                    <br/>
                    <label htmlFor="title">Manufacturer</label>
                    <input
                        type="text"
                        id="manufacturer"
                        name="manufacturer"
                        value={ this.state.platform.manufacturer || '' }
                        onChange={ event=> {
                            this.setState({
                                platform: {
                                    ...this.state.platform,
                                    manufacturer: event.target.value
                                }
                            });
                        }}
                        disabled={ this.state.activeTab === TabIdentifiers.EDIT && !this.state.platform.id }
                        className={ this.state.errors.filter(error => error.field === 'manufacturer')[0] ? 'error' : '' }
                    />
                    <br/>
                    <label htmlFor="title">Introduced</label>
                    <input
                        type="number"
                        id="introduced"
                        name="introduced"
                        value={ this.state.platform.introduced || '' }
                        onChange={ event=> {
                            this.setState({
                                platform: {
                                    ...this.state.platform,
                                    introduced: event.target.value
                                }
                            });
                        }}
                        disabled={ this.state.activeTab === TabIdentifiers.EDIT && !this.state.platform.id }
                        className={ this.state.errors.filter(error => error.field === 'manufacturer')[0] ? 'error' : '' }
                    />
                    <br/>
                    <label htmlFor="title">Technology</label>
                    <input
                        type="text"
                        id="technology"
                        name="technology"
                        value={ this.state.platform.technology || '' }
                        onChange={ event=> {
                            this.setState({
                                platform: {
                                    ...this.state.platform,
                                    technology: event.target.value
                                }
                            });
                        }}
                        disabled={ this.state.activeTab === TabIdentifiers.EDIT && !this.state.platform.id }
                        className={ this.state.errors.filter(error => error.field === 'manufacturer')[0] ? 'error' : '' }
                    />
                    <br/>
                    <label htmlFor="title">Noteworthy games</label>
                    <input
                        type="text"
                        id="game1"
                        name="game1"
                        className={ style.inputSmall }
                        disabled={ this.state.activeTab === TabIdentifiers.EDIT && !this.state.platform.game1 }
                    />
                    <input
                        type="text"
                        id="game2"
                        name="game2"
                        className={ style.inputSmall }
                        disabled={ this.state.activeTab === TabIdentifiers.EDIT && !this.state.platform.game2 }
                    />
                    <input
                        type="text"
                        id="game3"
                        name="game3"
                        className={ style.inputSmall }
                        disabled={ this.state.activeTab === TabIdentifiers.EDIT && !this.state.platform.game3 }
                    />
                    <input
                        type="text"
                        id="game4"
                        name="game4"
                        className={ style.inputSmall }
                        disabled={ this.state.activeTab === TabIdentifiers.EDIT && !this.state.platform.game4 }
                    />
                    <input
                        type="text"
                        id="game5"
                        name="game5"
                        className={ style.inputSmall }
                        disabled={ this.state.activeTab === TabIdentifiers.EDIT && !this.state.platform.game5 }
                    />
                    <br/>
                    <label htmlFor="select_generation">Select generation</label>
                    <select
                        name="generation"
                        id="generation"
                        onChange={ event => {
                            this.setState({
                                platform: {
                                    ...this.state.platform,
                                    generationId: event.target.value
                                }
                            });
                        }}
                        defaultValue={ this.state.platform.generationId || 'make_selection' }
                        disabled={ this.state.activeTab === TabIdentifiers.EDIT && !this.state.platform.id }
                    >
                        <option disabled="disabled" value="make_selection">Select generation</option>
                        { this.state.generations.map((generation, index) =>
                            <option key={ `generation-${index}` } value={ generation.id }>{ generation.title }</option>
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
                        data={ this.state.platform.description || '' }
                        onChange={ ( event, editor ) => {
                            const data = editor.getData();

                            this.setState({
                                platform: {
                                    ...this.state.platform,
                                    description: data
                                }
                            });
                        } }
                    />
                    <br/>
                    <button
                        type="submit"
                        disabled={ this.state.activeTab === TabIdentifiers.EDIT && !this.state.platform.id }
                    >{ this.state.activeTab === TabIdentifiers.ADD ? 'Add item' : 'Update item' }</button>
                    { this.state.activeTab === TabIdentifiers.EDIT ?
                        <button
                            className="danger"
                            onClick={ event => {
                                if (window.confirm('Are you sure you want to delete this item?')) {
                                    this.deleteItem(event);
                                }
                            } }
                            disabled={ !this.state.platform.id }
                        >Delete item</button> : null }
                </form>
            </Fragment>
        );
    }
}

export default Platforms;
