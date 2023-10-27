import { useState, useEffect } from "react";
import { Modal, Card, Row, Col } from "antd";
import { FilePdfOutlined } from "@ant-design/icons";
import request from '@/utils/request';
import {QUERY_PRODUCT_INFO} from '@/utils/url';
import styles from './index.module.scss';


export default (props) => {
    const initState = () => ({
            loading: false,
            productInfo: {},
            open: props.open || false,
        }),
        [state, setState] = useState(initState);

    const getProductInfo = (id) => {
        setState(o => ({...o, loading: true}));
        let url = QUERY_PRODUCT_INFO.replace(/\{productId\}/, id);
        request(url).then(response => {
            setState(o => ({...o, loading: false}));

            if(response?.code === '0') {
                let productInfo = response?.data || {};
                setState(o => ({...o, productInfo}));
            }else{
                message.error(`获取产品详情失败`);
            }
        }).catch(e => {
            setState(o => ({...o, loading: false}));
        })
    };

    useEffect(() => {
        setState(o => ({ ...o, open: props.open, productId: props.productId }));

        if(props.open) {
            getProductInfo(props.productId);
        }
    }, [props]);

    return (
        <Modal
            title={`产品详情 - ${state.productInfo?.name || ''}`}
            open={state.open}
            onCancel={props.onCancel}
            className={styles['dialog']}
            footer={null}
            width={900}
        >
            <Card title="基础信息">
                <Row gutter={12}>
                    <Col span={24} lg={{span: 8}}>
                    <label>名称：</label>{state.productInfo?.name || ''}
                    </Col>
                    <Col span={24} lg={{span: 8}}>
                    <label>规格：</label>{state.productInfo?.specification || ''}
                    </Col>
                    <Col span={24} lg={{span: 8}}>
                    <label>品牌：</label>{state.productInfo?.brand || ''}
                    </Col>
                </Row>
                <Row gutter={12}>
                    <Col span={24} lg={{span: 8}}>
                    <label>单位：</label>{state.productInfo?.unit || ''}
                    </Col>
                    <Col span={24} lg={{span: 8}}>
                    <label>重量：</label>{state.productInfo?.weight || ''} Kg
                    </Col>
                    <Col span={24} lg={{span: 8}}>
                    <label>方量：</label>{state.productInfo?.quantity || ''} m<sup>3</sup>
                    </Col>
                </Row>
            </Card>

            <Card title="其他信息">
                <Row gutter={12}>
                    <Col span={24} lg={{span: 12}}>
                    <label>供货周期：</label>{state.productInfo?.deliveryCycle || ''} 天
                    </Col>
                    <Col span={24} lg={{span: 12}}>
                    <label>备注：</label>{state.productInfo?.remark || ''}
                    </Col>
                </Row>
                <Row gutter={12} className="__row">
                    <Col span={24}>
                    <label>产品主图：</label>
                        {
                            state.productInfo?.productMainPicture ?
                                <a target="_blank" href={state.productInfo?.productMainPicture} download={state.productInfo?.name}><img src={state.productInfo?.productMainPicture} alt="" /></a>
                                :
                                null
                        }
                    </Col>
                </Row>
            </Card>
        </Modal>
    );
};