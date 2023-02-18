import AppConfig from './../../../../../../config/App.config.js';
import Helpers from './../../../../helpers/index.js';

import React, { Component, Fragment } from 'react';
import Editor from 'ckeditor5-custom-build/build/ckeditor';
import { CKEditor } from '@ckeditor/ckeditor5-react';

import AlertTypes from './../../../../constants/AlertTypes';
import AlertTexts from './../../../../constants/AlertTexts';
import ErrorTypes from '../../../../constants/ErrorTypes';
import TabIdentifiers from '../../constants/TabIdentifiers';

import Tabs from './../../../../components/Tabs/Tabs';

class Pages extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab: TabIdentifiers.ADD, // default opened tab
            errors: [], // contains form errors
            pages: [], // list of pages to pick from for editing
            page: {} // the currently loaded page for editing
        };
    }

    componentDidMount() {
        this.getPages();
    }

    /**
     * Resets state data linked to form fields
     */
    resetForm = () => {
        this.setState({
            pages: [],
            page: {}
        });
    };

    /**
     * Get all available pages
     */
    getPages = () => {
        document.querySelector('form').reset(); // resets the selection

        Helpers.Api.expressRequest(
            `${AppConfig.api.baseUrl}/api/admin/pages`,
            'GET'
        ).then(result => {

            // results go to state so they can be displayed
            this.setState({
                pages: result
            });

        }).catch(() => {

            // show friendly alert
            this.props.setAlert(AlertTypes.ERROR, AlertTexts.GENERAL);
        });
    };

    /**
     * Get properties for selected page
     * @param {Object} event - onChange event
     */
    getPage = event => {
        event.preventDefault();

        // first clear the current page info from state
        this.setState({
            page: {}
        });

        Helpers.Api.expressRequest(
            `${AppConfig.api.baseUrl}/api/admin/pages/${event.target.value}`,
            'GET'
        ).then(result => {

            // results go to state so they can be displayed (unless on initial load)
            this.setState({
                page: result || {}
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

        Helpers.Api.expressRequest(
            `${AppConfig.api.baseUrl}/api/admin/pages`,
            'POST',
            JSON.stringify(this.state.page)
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

            // reload pages in case something was changed
            this.getPages();

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
            `${AppConfig.api.baseUrl}/api/admin/pages/${this.state.page.id}`,
            'PUT',
            JSON.stringify(this.state.page)
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

            // reload pages in case something was changed
            this.getPages();

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
            `${AppConfig.api.baseUrl}/api/admin/pages/${this.state.page.id}`,
            'DELETE'
        ).then(result => {

            if (result === 0) {
                throw new Error(ErrorTypes.NOT_FOUND);
            }

            // show friendly alert
            this.props.setAlert(AlertTypes.MESSAGE, `${AlertTexts.DELETED}`);

            this.resetForm();

            // reload pages in case something was changed
            this.getPages();

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
                <label htmlFor="select_page">Select page</label>
                <select
                    name="select_page"
                    onChange={ event => {
                        this.setState({
                            errors: []
                        }, () => {
                            this.getPage(event);
                        });
                    }}
                    defaultValue="make_selection"
                >
                    <option disabled="disabled" value="make_selection">Select page</option>
                    { this.state.pages.map((page, index) =>
                        <option key={ `page-${index}` } value={ page.id }>{ page.title }</option>
                    ) }
                </select>
                <br />
            </Fragment>;
        }

        return (
            <Fragment>
                <h3>Pages</h3><br/>
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
                        this.getPages();
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
                        value={ this.state.page.title || '' }
                        onChange={ event=> {
                            this.setState({
                                page: {
                                    ...this.state.page,
                                    title: event.target.value
                                }
                            });
                        }}
                        disabled={ this.state.activeTab === TabIdentifiers.EDIT && !this.state.page.id }
                        className={ this.state.errors.filter(error => error.field === 'title')[0] ? 'error' : '' }
                    />
                    <br/>
                    <label htmlFor="title">Slug</label>
                    <input
                        type="text"
                        id="slug"
                        name="slug"
                        value={ this.state.page.slug || '' }
                        onChange={ event=> {
                            this.setState({
                                page: {
                                    ...this.state.page,
                                    slug: event.target.value
                                }
                            });
                        }}
                        disabled={ this.state.activeTab === TabIdentifiers.EDIT && !this.state.page.id }
                        className={ this.state.errors.filter(error => error.field === 'slug')[0] ? 'error' : '' }
                    />
                    <br/>
                    <label htmlFor="description">Description</label>
                    <CKEditor
                        editor={ Editor }
                        config={{
                            ...AppConfig.ckEditorConfiguration,
                            extraPlugins: [ Helpers.ExpressImageUploader ]
                        }}
                        data={ this.state.page.description || '' }
                        onChange={ ( event, editor ) => {
                            const data = editor.getData();

                            this.setState({
                                page: {
                                    ...this.state.page,
                                    description: data
                                }
                            });
                        } }
                    />
                    <br/>
                    <button
                        type="submit"
                        disabled={ this.state.activeTab === TabIdentifiers.EDIT && !this.state.page.id }
                    >{ this.state.activeTab === TabIdentifiers.ADD ? 'Add item' : 'Update item' }</button>
                    { this.state.activeTab === TabIdentifiers.EDIT ?
                        <button
                            className="danger"
                            onClick={ event => {
                                if (window.confirm('Are you sure you want to delete this item?')) {
                                    this.deleteItem(event);
                                }
                            } }
                            disabled={ !this.state.page.id }
                        >Delete item</button> : null }
                </form>
            </Fragment>
        );
    }
}

export default Pages;
