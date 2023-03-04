import React, { Component } from 'react';

import style from './style/hero.scss';

class Hero extends Component {
    render() {
        return (
            <header className={ style.hero }>

                <h1 className={ style.logo }>
                    <span>V</span>
                    <span>A</span>
                    <span>N</span>
                    <span>O</span>
                    <span>O</span>
                    <span>I</span>
                    <span>J</span>
                    <span>.</span>
                    <span>N</span>
                    <span>L</span>
                    <span>RETROSPECTIVE ON 40 YEARS OF GAMING</span>
                </h1>

                { this.props.children || null }

            </header>
        );
    }
}

export default Hero;
