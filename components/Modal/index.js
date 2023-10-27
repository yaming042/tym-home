import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import styles from './index.module.scss';

export default class App extends Component{
    constructor(props) {
        super(props);

        this.state = {
            open: props.open || false,
            hasInit: false,
        };

    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.open !== this.props.open) {
            this.setState({
                open: nextProps.open || false,
                hasInit: nextProps.open,
            });
        }
    }

    componentWillUnmount() {
        this.setState({
            open: false,
            hasInit: false,
        });
    }

    getPopupContainer() {
        // 自定义渲染容器的逻辑
        // 这里简单示范，将弹框渲染到触发它的按钮元素的父元素内部
        return this.props.getPopupContainer;
    };

    render() {
        const {state} = this,
            {onMaskClick, width, children=null} = this.props,
            container = this.getPopupContainer();

        if(!state.open && !state.hasInit) return null;

        // 使用 ReactDOM.createPortal 将弹框内容渲染到自定义容器中
        return ReactDOM.createPortal(
            <div className={`${styles['container']} ${this.props.className}`} style={{display: state.open ? 'block' : 'none'}}>
                <div className={styles['drawer-mask']} onClick={onMaskClick}></div>
                <div className={styles['drawer-content']}>
                    <div className={styles['drawer-body']} style={{width: width || 360}}>{children || null}</div>
                </div>
            </div>,
            container
        );
    }
}