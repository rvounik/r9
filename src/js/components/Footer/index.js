import React, { Component } from 'react';

import MaterialIcon from './../MaterialIcon';

import style from './style/footer.scss';

class Footer extends Component {
    render() {

        return (
            <footer className={ style.footer }>
                <nav id="nav_footer">
                    <ul>
                        <li>
                            <a href="mailto:website@vanooij.nl" target="_blank" rel="noreferrer">
                                <MaterialIcon icon={ 'mail_outline' } classes={{ iconStyle: style.iconStyle }} />
                                <span>E-mail</span>
                            </a>
                        </li>
                        <li>
                            <a href="http://www.vanooij.nl" target="_blank" rel="noreferrer">
                                <MaterialIcon icon={ 'desktop_windows' } classes={{ iconStyle: style.iconStyle }} />
                                <span>www.vanooij.nl</span>
                            </a>
                        </li>
                        <li>
                            <a href="http://www.github.com/rvounik" target="_blank" rel="noreferrer">
                                <MaterialIcon icon={ 'code' } classes={{ iconStyle: style.iconStyle }} />
                                <span>Github</span>
                            </a>
                        </li>
                        <li>
                            <a href="https://www.linkedin.com/in/robbinvanooij/" target="_blank" rel="noreferrer">
                                <MaterialIcon icon={ 'person' } classes={{ iconStyle: style.iconStyle }} />
                                <span>LinkedIn</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </footer>
        );
    }
}

export default Footer;
