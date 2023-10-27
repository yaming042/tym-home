'use client'

import { useEffect, useState } from 'react';
import styles from './index.module.scss';

export default (props) => {
    const initState = () => ({
            loginOpen: false,
            userInfo: {},
        }),
        [state, setState] = useState(initState);

    return (
        <div className={`${styles['container']} header-container`}>
            <div className={styles['content']}>
                <div className="logo">
                    <a href="/">
                        <img src="/images/logo.png" alt="" />
                    </a>
                </div>
                <div className="opt">
                    <div className='opt-item'>
                        <img src="/images/hot.png" alt="" />
                        <span>NOTE<sup>m</sup>首发上线</span>
                    </div>
                    <div className='opt-item looking'>
                        <span>RT-Admin 即将上线</span>
                        <img src="/images/looking.png" alt="" />
                    </div>
                </div>
            </div>
        </div>
    );
}