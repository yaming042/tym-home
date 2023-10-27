import styles from './index.module.scss';

export default (props) => {
    return (
        <div className={styles['container']}>
            <footer>
                <div className="row">
                    <div className="col-3">TYM的小破站</div>
                    <div className="col-3">©2023 TYM的小破站</div>
                    <div className="col-3"><a href="https://beian.miit.gov.cn" target="_blank" style={{color:'#fff'}}>豫ICP备17028068号</a></div>
                    <div className="col-3">工信部ICP备案</div>
                </div>
            </footer>
        </div>
    );
}