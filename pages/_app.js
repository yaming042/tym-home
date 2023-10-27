'use client';

import Head from "next/head";
import Layout from "../layouts";
import './_reset.css';
import './global.css';

export default function MyApp({ Component, pageProps }) {
    const isSingle = Component.isSingle || null;

    return (
        <>
            <Head>
                <title>TYM的小破站</title>
                <meta name="description" content="探索我的个人综合网站，其中包括项目展示、职业生涯发展、工作经验、生活片段记录、心得分享，以及职业规划的见解。这里记录了我多方面的经历和收获，欢迎探索与分享。" />
                <meta name="keywords" content="个人网站、项目展示、职业规划、工作经验、生活记录、心得分享、综合性网站" />
                <link rel="shortcut icon" href="/images/favicon.ico" type="image/x-icon" />
                <script src="/js/jquery.min.js"></script>
            </Head>

            {
                !isSingle ?
                    <Layout>
                        <Component {...pageProps} />
                    </Layout>
                    :
                    <Component {...pageProps} />
            }
        </>
    );
}