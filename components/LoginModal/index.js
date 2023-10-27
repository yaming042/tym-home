import Modal from './../Modal';
import styles from './index.module.scss';


export default (props) => {
    return (
        <Modal
            onMaskClick={props.onMaskClick}
            open={props.open}
            width={props.width || 560}
            className={`${styles['container']} ${props.className}`}
            getPopupContainer={props.getPopupContainer}
        >
            {props.children || null}
        </Modal>
    );
}

