import styles from './index.module.scss';

export default () => {
    return (
        <div className={`${styles.main}`}>
            <div className="main">
                <div className="section-1">
                    <div className="text">
                        <h2>NOTE<sup>m</sup>，基于GitHub构建的笔记应用</h2>
                        <div className="desc">NOTE<sup>m</sup>是一个专业的笔记和备忘录平台，让您轻松记录和组织您的思绪、灵感和任务。无论是学习笔记、工作备忘、或创意灵感，NOTE<sup>m</sup>提供一体化流程，帮助您保存和随时访问您的笔记信息</div>
                        <div className="use-now">
                            <a href="//notem.tyaming.com">立即使用</a>
                        </div>
                    </div>
                </div>
                <div className="section-2">
                    <div className="item">
                        <h3>简简单单</h3>
                        <div className="desc">只需一个github账号即可开始属于自己的笔记生活</div>
                        <div className="img">
                            <img src="http://cache.yaming.me/tymweb/features_1.png" alt="" />
                        </div>
                    </div>
                    <div className="item">
                        <h3>安安全全</h3>
                        <div className="desc">全程不存储您一丝信息，接口代码github随时可查</div>
                        <div className="img">
                            <img src="http://cache.yaming.me/tymweb/features_2.png" alt="" />
                        </div>
                    </div>
                    <div className="item">
                        <h3>清清爽爽</h3>
                        <div className="desc">杜绝杂乱的菜单、目录，给你一个简洁大方的页面</div>
                        <div className="img">
                            <img src="http://cache.yaming.me/tymweb/features_3.png" alt="" />
                        </div>
                    </div>
                </div>
                <div className="section-3">
                    <div className="desc">
                        <div className='title'>后期愿景：</div>
                        <ul>
                            <li>毕竟笔记是存储在github上的，针对那些对数据隐私有需求的用户，应用应该尽可能的保证他们的隐私不被侵犯，因此后面应用会增加隐私保存功能，敬请期待。</li>
                            <li>作为一款笔记类工具，应该支持离线使用，后期计划加上本地存储，保证用户不使用github账号也可以正常写作，敬请期待。</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}