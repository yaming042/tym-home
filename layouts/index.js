import {ConfigProvider} from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
dayjs.locale('zh-cn'); // 全局使用简体中文

import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
    return (
        <ConfigProvider
            locale={zhCN}
            theme={{
                token: {
                    colorPrimary: '#0AC266',
                }
            }}
        >
            <Header />
            <main className='web-container'>{children}</main>
            <Footer />
        </ConfigProvider>
    )
}