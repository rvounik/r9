import React, { Component } from 'react';

import style from './style/selectplatform.scss';

class SelectPlatform extends Component {
    render() {
        const { platforms, selectedPlatform, onChange } = this.props;

        const options = platforms.map(platform =>
            <option
                key={ `generation-${platform.id}` }
                value={ platform.slug }
            >{ platform.title }</option>
        );

        options.unshift(
            <option key={ 'make-selection' } disabled="disabled" value="make_selection">Select platform</option>
        );

        return (
            <select
                name="select_platform"
                id="select_platform"
                defaultValue={ selectedPlatform ? selectedPlatform : 'make_selection' }
                className={ style.select_platform }
                onChange={ event => {
                    onChange(event);
                } }
            >
                { options }
            </select>
        );
    }
}

export default SelectPlatform;
