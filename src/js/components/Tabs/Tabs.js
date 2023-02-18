import React, { Component } from 'react';
import style from './style/tabs.scss';

export default class Tabs extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab: this.props.activeTab || this.props.tabs[0].id
        };
    }

    switchTab = tab => {
        this.setState({
            activeTab: tab
        }, () => {
            this.props.onSwitchTab(tab);
        });
    };

    render() {
        const { tabs } = this.props;

        return (
            <div className={ style.tabs }>
                { tabs.map((tab, index) =>
                    <span
                        key={ `tab-${index}` }
                        onClick={ () => {
                            this.switchTab(tab.id);
                        } }
                        className={ `${style.tab} ${this.state.activeTab === tab.id ? style.active : null}`}
                    >{ tab.title }</span>
                ) }
            </div>
        );
    }
}
