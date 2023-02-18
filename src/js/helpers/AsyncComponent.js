import React, { Component } from 'react';

const AsyncComponent = (importComponent, props = {}) =>
    class extends Component {
        state = {
            mounted: false,
            component: null
        };

        // force state update since importComponent cannot be run when component is not mounted yet
        componentDidMount() {
            this.setState({ mounted: true });
        }

        componentDidUpdate() {
            if (!this.state.component && this.state.mounted) {
                importComponent()
                    .then(cmp => {
                        this.setState({ component: cmp.default });
                    });
            }
        }

        render() {
            const C = this.state.component;

            return C ? <C { ...this.props } { ...props }/> : null;
        }
    };

export default AsyncComponent;

// todo: add propTypes, jsdoc
