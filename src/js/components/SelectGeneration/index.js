import React, { Component } from 'react';

import style from './style/selectgeneration.scss';

class SelectGeneration extends Component {
    render() {
        const { generations, selectedGeneration, onChange } = this.props;

        return (
            <select
                name="select_generation"
                id="select_generation"
                defaultValue={ selectedGeneration }
                className={ style.select_generation }
                onChange={ event => {
                    onChange(event);
                } }
            >
                { generations.map(generation =>
                    <option
                        key={ `generation-${generation.id}` }
                        value={ generation.slug }
                    >{ generation.title } ({ generation.yearStart }-{ generation.yearEnd })</option>
                )}
            </select>
        );
    }
}

export default SelectGeneration;
