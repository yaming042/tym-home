import { useState, useEffect } from "react";
import { Input, Select, Button, Switch, Tooltip, InputNumber, message } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import request from '@/utils/request';
import {
    QUERY_PRODUCT_BY_CATEGORY_ID,
    QUERY_QUOTATION_INFO,
    QUERY_USER_INFO,
    MONEY_CALC,
    ADD_QUOTATION,
    GET_QUOTATION_ID,
} from '@/utils/url';
import { deepCopy, uniqueArrayById, getParameterByName, numberToChinese, getUuid, divideAndRound } from '@/utils';
import CategoryTree from './../CategoryTree';
import ViewProduct from './../ViewProduct';
import styles from './index.module.scss';


const infoWithTax = `1、以上货品总计总量约为0吨，总计方量约为0立方；
2、供货周期0天，具体以业务专员沟通为准；
3、该报价含税不含运费，如需含运费，由客服人员计算后调整报价单；
4、装车地址：成都市青白江区华川银地板材区46栋优嘉贝帝集采仓库；
5、基于双方共同信任的基础上，给于此项目最高优惠政策，预祝合作成功。`;
const infoWithoutTax = `1、以上货品总计总量约为0吨，总计方量约为0立方；
2、供货周期0天，具体以业务专员沟通为准；
3、该报价不含税不含运费，如需含运费，由客服人员计算后调整报价单；
4、装车地址：成都市青白江区华川银地板材区46栋优嘉贝帝集采仓库；
5、基于双方共同信任的基础上，给于此项目最高优惠政策，预祝合作成功。`;


export default (props) => {
    const initState = () => {
            let quotationId = getParameterByName('id');

            return {
                isReadOnly: false,
                quotationInfo: {},
                quotationInfoBak: {},
                additionInfo: [],
                defaultId: '',

                qtData: [],

                standards: [], // 规格池，每选择一个规格，指定分类下的规格新增一次
                quotationId,
                selectedProductIds: [], // 已经选择的产品id

                clientInfo: {}, // 当前用户信息
                clientId: '',
                customerServiceName: '',
                salesmanName: '',
                customerServicePhone: '',
                salesmanPhone: '',

                includeTax: true,

                submitting: false,

                viewOpen: false,
                viewProductId: '',

                customerOpen: false,
            }
        },
        [state, setState] = useState(initState);

    // 获取客户信息
    const getCustomerInfo = (cb) => {
        request(QUERY_USER_INFO).then(response => {
            if (response?.code) {
                let clientInfo = response?.data || {};

                setState(o => ({
                    ...o,
                    clientId: clientInfo?.id || '',
                    clientInfo,
                    customerServicePhone: clientInfo?.customerServicePhone || '',
                    salesmanPhone: clientInfo?.salesmanPhone || '',
                    customerServiceName: clientInfo?.customerServiceName || '',
                    salesmanName: clientInfo?.salesmanName || '',
                }));
            }
        }).catch(e => { });
    };
    // 获取默认报价单id
    const getQuotationId = () => {
        request(GET_QUOTATION_ID).then(response => {
            let qq = setRemark({remark: ''}, true);
            setState(o => ({ ...o, defaultId: response?.data?.code || '', quotationInfo: qq }));
        });
    };
    // 获取报价单详情
    const getQuotationInfo = (quotationId) => {
        let url = QUERY_QUOTATION_INFO.replace(/\{quotationId\}/, quotationId);

        // 门户的报价单用户不能编辑，只能看
        request(url).then(response => {
            if (response?.code) {
                let quotationInfo = response.data || {},
                    clientId = quotationInfo.clientId || undefined,
                    selectedCategoryIds = (quotationInfo?.products || []).map(i => i.categoryId),
                    isReadOnly = true || quotationInfo?.status !== 10,
                    additionInfo = [],
                    customerServicePhone = quotationInfo.customerServicePhone || '',
                    salesmanPhone = quotationInfo.salesmanPhone || '',
                    customerServiceName = quotationInfo.customerServiceName || '',
                    salesmanName = quotationInfo.salesmanName || '',
                    quotationInfoo = setRemark(quotationInfo, true);

                try {
                    additionInfo = JSON.parse(quotationInfo.additionInfo) || [];
                } catch (e) {
                    console.log(e);
                }

                setState(o => ({
                    ...o,
                    quotationInfo: quotationInfoo,
                    clientId,
                    quotationInfoBak: deepCopy(quotationInfoo),
                    isReadOnly,
                    additionInfo,
                    customerServicePhone,
                    salesmanPhone,
                    customerServiceName,
                    salesmanName,
                }));

                // 还需要请求分类下指定的所有规格
                selectedCategoryIds?.length && handleMapData(selectedCategoryIds, clientId);
            }
        }).catch(e => { });
    };

    // 获取指定分类下的所有规格产品
    const getProductByCategoryId = (categoryIds = '', clientId = '') => {
        clientId = clientId || state.clientId;

        return new Promise((resolve, reject) => {
            request(QUERY_PRODUCT_BY_CATEGORY_ID, { data: { categoryIds, clientId } }).then(response => {
                resolve(response?.data || []);
            }).catch(e => {
                resolve([]);
            });
        })
    };
    // 计算产品的价格
    const calcMoney = async (clientId, products) => {
        return new Promise((resolve) => {
            if (!products.length) {
                return resolve({});
            }

            request(MONEY_CALC, { method: 'post', data: { clientId, products } }).then(response => {
                resolve(response?.data || {});
            }).catch(e => {
                resolve({});
            });
        });
    };
    // 请求规格数据，处理成tree结构，方便记录分类、品牌、规格的关系
    const handleMapData = async (keys = [], clientId, type='') => {
        let { qtData = [], quotationInfo } = state;
        // 请求该分类下的所有规格
        let allProducts = await getProductByCategoryId(keys.join(','), clientId);

        if('onSelect' === type) {
            if(allProducts?.length === 0) {
                message.warning(`该分类下没有可选的产品`);

                // 把对应的categoryId这行给去掉
                if(keys.length === 1) {
                    quotationInfo.products = (quotationInfo.products || []).filter(i => i.categoryId !== keys[0]);

                    setState(o => ({...o, quotationInfo}));
                }

                return;
            }else{
                if(keys.length === 1) {
                    // 只有一个规格
                    if(allProducts.length === 1) {
                        let hasAdd = (quotationInfo.products || []).filter(i => i.categoryId === keys[0] && i.brand && i.productId)?.length === 1;

                        if(hasAdd) {
                            message.warning(`该分类下只有一个产品，且已添加`);
                            quotationInfo.products = (quotationInfo.products || []).filter(i => i.categoryId !== keys[0] || (i.categoryId === keys[0] && i.brand && i.productId));
                        }else{
                            quotationInfo.products = (quotationInfo.products || []).map(i => {
                                if(i.categoryId === keys[0]) {
                                    i['brand'] = allProducts[0]?.brand;
                                    i['productId'] = allProducts[0]?.id;
                                    i['unit'] = allProducts[0]?.unit || '';
                                }

                                return i;
                            });
                        }
                    }else{
                        // 只有一个品牌
                        let allBrand = uniqueArrayById(allProducts.filter(i => i.categoryId === keys[0]).map(i => ({brand: i.brand})), 'brand');

                        if(allBrand.length === 1) { // 只有一个品牌，自动带出
                            quotationInfo.products = (quotationInfo.products || []).map(i => {
                                if(i.categoryId === keys[0]) {
                                    i['brand'] = allBrand[0]?.brand;
                                    i['unit'] = allBrand[0]?.unit || '';
                                }

                                return i;
                            });
                        }
                    }

                    setState(o => ({...o, quotationInfo}));

                    // 重新计价
                    reCalc(clientId, quotationInfo);
                }
            }
        }

        // 从产品中整理出所有的品牌，分类与品牌的关系; 从产品中整理出规格，品牌与规格的关系
        keys.map(item => {
            let co = allProducts.find(i => i.categoryId === item),
                categoryName = co?.categoryName,
                productMainPicture = co?.productMainPicture,
                index = qtData.findIndex(i => i.value === item),
                eb = (qtData[index]?.brand || []).map(i => ({ value: i.value, label: i.label })),
                allBrand = uniqueArrayById(allProducts.filter(i => i.categoryId === item).map(item => ({ value: item.brand, label: item.brand })).concat(eb), 'value')
                    .map(item => {
                        let o = uniqueArrayById(allProducts.filter(i => i.brand === item.value).map(i => ({ value: i.id, label: i.specification, unit: i.unit })), 'value');

                        return { ...item, product: o }
                    }),
                newObj = {
                    value: item,
                    label: categoryName,
                    productMainPicture,
                    brand: allBrand
                }
            if (index !== -1) {
                qtData.splice(index, 1, newObj);
            } else {
                qtData.push(newObj);
            }
        });

        setState(o => ({ ...o, qtData }));
    };
    // 提交 - 请求接口
    const addOrUpdateQuotation = (values) => {
        setState(o => ({ ...o, submitting: true }));
        request(ADD_QUOTATION, { method: 'post', data: values }).then(response => {
            if (response?.code === '0') {
                message.success(`${values.id ? '更新' : '创建'}报价单成功！`);

                let t = setTimeout(() => {
                    clearTimeout(t);

                    goBack();
                }, 1500);
            } else {
                setState(o => ({ ...o, submitting: false }));
            }
        }).catch(e => {
            message.error(e?.message);
            setState(o => ({ ...o, submitting: false }));
        })
    };


    // 选择一个产品，列表增加一条，分类池里也需要新增一条
    const onSelect = async (keys) => {
        let { quotationInfo, clientId } = state;
        if (!clientId) {
            message.warning(`请登录后重试`);
            return;
        }

        if (!quotationInfo.products) quotationInfo.products = [];
        keys.map(item => quotationInfo.products.push({ categoryId: item, amount: 1 }));
        setState(o => ({ ...o, quotationInfo }));

        // 处理映射关系
        handleMapData(keys, clientId, 'onSelect');
    }
    // 添加自定义产品
    const addNewProduct = () => {
        let { additionInfo = [] } = state;
        additionInfo.push({ id: getUuid(), isNew: true, amount: 1 });
        setState(o => ({ ...o, additionInfo }));
    };

    // 移除一个已选择的产品，对应的categories中也需要移除,TODO
    const removeOne = (index) => {
        let { quotationInfo } = state;
        quotationInfo.products.splice(index, 1);

        let standards = quotationInfo.products.map(item => item.productId).filter(Boolean);
        setState(o => ({ ...o, quotationInfo, standards }));

        // 有可能需要重新计价，TODO，reCalc
        reCalc();
    };
    // 查看产品详情
    const viewOne = (id = '') => {
        if (!id) {
            message.warning(`选择产品规格后可查看`);
            return;
        }
        setState(o => ({ ...o, viewOpen: true, viewProductId: id }));
    };
    // 改变选中的材料，品牌和规格需要重置，顺便数量也重置吧，选中的品牌、规格也需要重置
    const onChangeCategory = (index, categoryId) => {
        let { quotationInfo, clientId } = state;
        quotationInfo.products.splice(index, 1, { categoryId, amount: 1 });

        let standards = quotationInfo.products.map(item => item.productId).filter(Boolean);
        setState(o => ({ ...o, quotationInfo, standards }));

        // 有可能需要重新计价，TODO，reCalc
        reCalc(clientId, quotationInfo);
    };
    // 改变选中的品牌，重置规格
    const onChangeBrand = (index, categoryId, brandId) => {
        let { quotationInfo } = state;
        quotationInfo.products[index]['brand'] = brandId;
        quotationInfo.products[index]['productId'] = undefined;
        quotationInfo.products[index]['unit'] = '';
        let standards = quotationInfo.products.map(item => item.productId).filter(Boolean);

        setState(o => ({ ...o, quotationInfo, standards }));

        // 有可能需要重新计价，TODO，reCalc
        reCalc();
    };
    // 改变选中的规格
    const onChangeProduct = (index, productId) => {
        let { quotationInfo, qtData } = state,
            categoryId = quotationInfo.products[index].categoryId,
            brandId = quotationInfo.products[index].brand;

        quotationInfo.products[index]['productId'] = productId;

        let standards = quotationInfo.products.map(item => item.productId).filter(Boolean);

        // 查找规格对应的 单位
        let obj = ((qtData.find(i => i.value === categoryId)?.brand || []).find(i => i.value === brandId)?.product || []).find(i => i.value === productId)
        quotationInfo.products[index]['unit'] = obj?.unit || '';

        setState(o => ({ ...o, quotationInfo, standards }));

        // 有可能需要重新计价，TODO，reCalc
        reCalc();
    };
    // 直接改变数量
    const onChangeAmount = (index, value) => {
        let { quotationInfo, clientId } = state;

        quotationInfo.products[index]['amount'] = value;

        setState(o => ({ ...o, quotationInfo }));

        // 有可能需要重新计价，TODO，reCalc
        reCalc(clientId, quotationInfo);
    };
    // 修改项目名称
    const onChangeProductName = (e) => {
        let { quotationInfo } = state,
            name = e.target.value;

        quotationInfo['projectName'] = name;

        setState(o => ({ ...o, quotationInfo }));
    };
    // 修改备注
    const onChangeRemark = (e) => {
        let { quotationInfo } = state,
            name = e.target.value;

        quotationInfo['remark'] = name;

        setState(o => ({ ...o, quotationInfo }));
    };
    // 自定义产品的修改
    const onChangeNew = (key, index, e) => {
        let { additionInfo } = state;
        let v = e?.target?.value;
        if(typeof e === 'number') {
            v = e;
        }
        additionInfo[index][key] = v;

        setState(o => ({ ...o, additionInfo }));
    };
    // 自定义产品的移除
    const removeOneNew = (index) => {
        let { additionInfo } = state;
        additionInfo.splice(index, 1);
        setState(o => ({ ...o, additionInfo }));
    };

    // 材料的可选项
    const getCategoryOptions = (item) => {
        let { qtData } = state;

        return qtData.map(o => {
            return ({
                value: o.value,
                label: o.label,
                disabled: false,
            })
        });
    };
    // 品牌的可选项
    const getBrandOptions = (item) => {
        let { qtData } = state,
            categoryId = item.categoryId;

        return (qtData.find(i => i.value === categoryId)?.brand || []).map(o => {
            return ({
                value: o.value,
                label: o.label,
                disabled: false,
            })
        });
    };
    // 规格的可选项
    const getProductOptions = (item) => {
        let { qtData, standards } = state,
            categoryId = item.categoryId,
            brand = item.brand;

        return ((qtData.find(i => i.value === categoryId)?.brand || [])
            .find(i => i.value === brand)?.product || [])
            .map(o => {

                return ({
                    value: o.value,
                    label: o.label,
                    disabled: standards.filter(i => i !== item.productId).includes(o.value),
                })
            });
    };
    // 单价
    const getUnitPrice = (index) => {
        let { includeTax, quotationInfo } = state,
            qtRowData = quotationInfo.products[index] || {};

        return qtRowData[includeTax ? 'unitPriceWithTax' : 'unitPriceWithoutTax'] || '0';
    };
    // 小计
    const getSubTotalPrice = (index) => {
        let { includeTax, quotationInfo } = state,
            qtRowData = quotationInfo.products[index] || {};

        return qtRowData[includeTax ? 'subtotalWithTax' : 'subtotalWithoutTax'] || '0';
    };
    const getUnitUnit = (index) => {
        let { quotationInfo } = state,
            qtRowData = quotationInfo.products[index] || {};

        return qtRowData['unit'] || '';
    };
    // 获取总计
    const getTotalPrice = () => {
        let { includeTax, quotationInfo } = state;

        return quotationInfo[includeTax ? 'totalPriceWithTax' : 'totalPriceWithoutTax'] || '0';
    };
    // 获取价格大写
    const getMoneyText = () => {
        let { includeTax, quotationInfo } = state,
            moneyTax = quotationInfo?.totalPriceWithTax || 0,
            moneyNoTax = quotationInfo?.totalPriceWithoutTax || 0;

        return numberToChinese(includeTax ? moneyTax : moneyNoTax);
    };

    // ======
    const setProductMoney = (result = {}) => {
        let { quotationInfo } = state,
            calcItemMap = result.calcItemMap || {},
            qp = quotationInfo?.products || [];

        qp = qp.map(item => {
            let product = calcItemMap[item.productId] || {};
            item.unitPriceWithTax = product.unitPriceWithTax || 0;
            item.unitPriceWithoutTax = product.unitPriceWithoutTax || 0;
            item.subtotalWithTax = product.subtotalWithTax || 0;
            item.subtotalWithoutTax = product.subtotalWithoutTax || 0;

            return item;
        });

        quotationInfo['totalPriceWithTax'] = result.totalPriceWithTax || 0;
        quotationInfo['totalPriceWithoutTax'] = result.totalPriceWithoutTax || 0;
        quotationInfo['maxDeliveryCycle'] = result.maxDeliveryCycle || 0;
        quotationInfo['totalWeight'] = result.totalWeight || 0;
        quotationInfo['totalQuantity'] = result.totalQuantity || 0;
        quotationInfo['products'] = qp.slice(0);

        return quotationInfo;
    };
    const setRemark = (result = {}, includeTax) => {
        result.remark = (result.remark || (includeTax ? infoWithTax : infoWithoutTax) || '')
            .replace(/为((?:[1-9]\d*|0)?(?:\.\d+)?)吨/, `为${divideAndRound(result.totalWeight || 0, 1000)}吨`)
            .replace(/为((?:[1-9]\d*|0)?(?:\.\d+)?)立方/, `为${result.totalQuantity || 0}立方`)
            .replace(/周期((?:[1-9]\d*|0)?(?:\.\d+)?)天/, `周期${result.maxDeliveryCycle || 0}天`);

        if(includeTax) {
            result.remark = (result.remark || '').replace(/该报价不含税不含运费/, '该报价含税不含运费')
        }else{
            result.remark = (result.remark || '').replace(/该报价含税不含运费/, '该报价不含税不含运费')
        }

        return result;
    };
    // 重新计算价格 - 相当于重新获取一次详情
    const reCalc = (clientId, quotationInfo, includeTax='') => {
        clientId = clientId || state.clientId;
        quotationInfo = quotationInfo || state.quotationInfo;
        includeTax = includeTax === '' ? state.includeTax : includeTax;

        let qp = quotationInfo?.products || [],
            products = qp.map(i => ({ productId: i.productId, amount: i.amount })).filter(i => i.productId && i.amount);

        if (!clientId) {
            message.warning(`选择客户后重新计算价格`);
            return;
        }

        calcMoney(clientId, products).then(obj => {
            let q = setProductMoney(obj),
                qq = setRemark(q, includeTax);
            setState(o => ({ ...o, quotationInfo: qq }));
        });
    };
    // ======

    // 只有编辑状态下才重新计价，出库中和已完成是不重新计价的
    const onSwitchTax = (checked) => {
        let { clientId, quotationInfo } = state,
            qp = (quotationInfo?.products || []).map(i => ({ productId: i.productId, amount: i.amount })).filter(i => i.productId && i.amount),
            sendRequest = quotationInfo?.status === 10;

        if (!qp.length || !clientId) {
            sendRequest = false;
        }

        setState(o => ({ ...o, includeTax: checked }));
        // 必须全部数据都满足才进行计算
        if(sendRequest) {
            reCalc(clientId, quotationInfo, checked);
        }else{
            let qq = setRemark(quotationInfo, checked);
            setState(o => ({...o, quotationInfo: qq}));
        }
    }
    const goBack = () => window.location.href = '/account';

    // 提交校验
    const submitCheck = () => {
        let { quotationInfo, clientId, additionInfo } = state,
            products = quotationInfo?.products || [];

        if (!clientId) {
            message.warning(`请选择需要的客户`);
            return;
        }
        if (!products.length && !additionInfo?.length) {
            message.warning(`请选择需要的产品`);
            return;
        }

        for (let i = 0; i < products.length; i++) {
            let o = products[i];

            if (o.isNew) continue;
            if (!o?.categoryId || !o?.brand || !o?.productId || !o?.amount) {
                message.warning(`请检查所选产品数据是否完整`);
                return;
            }
        }

        return true;
    };
    const submit = () => {
        let { clientId, quotationInfo, additionInfo, defaultId } = state,
            ok = submitCheck(),
            postData = {
                clientId,
                code: quotationInfo?.code || defaultId || '',
                additionInfo: JSON.stringify(additionInfo),
                projectName: quotationInfo.projectName || '未提供',
                paymentChannel: '',
                status: quotationInfo.status || 10,
                remark: quotationInfo.remark,
                products: (quotationInfo.products || []).map(i => ({ productId: i.productId, amount: i.amount, stockStatus: '', remark: '' })),
            };

        if (quotationInfo.id) {
            postData['id'] = quotationInfo.id;
        }

        // 保存时都是按含税的备注信息保存
        let v = setRemark(quotationInfo, true);
        if (ok) addOrUpdateQuotation({...postData, remark: v.remark});
    };

    useEffect(() => {
        if (state.quotationId && state.quotationId !== 'new') {
            getQuotationInfo(state.quotationId);
        } else {
            getQuotationId();
        }

        getCustomerInfo();
    }, []);

    return (
        <div className={styles['container']}>
            {
                state.isReadOnly ?
                    null
                    :
                    <div className={styles['tree-page']}>
                        <CategoryTree
                            onSelect={onSelect}
                        />
                    </div>
            }
            <div className={styles['form-page']}>
                <div className={styles['header']}>
                    <div className={styles['name']}>
                        <span>{state.quotationInfo?.code || state.defaultId || '--'}</span>
                    </div>
                    <div className={styles['logo']}>
                        <img src={`/images/logo_text.png`} alt="" />
                    </div>
                </div>
                <div className={styles['base-info']}>
                    <div className={styles['row']}>
                        <div className={styles['label']}>客户:</div>
                        <div className={styles['input']}>
                            <div className={styles['custom-option']}>
                                <div>{state.clientInfo?.name ? `${state.clientInfo?.name}(${state.clientInfo?.phone})` : state.clientInfo?.phone}</div>
                            </div>
                        </div>
                    </div>
                    <div className={styles['row']}>
                        <div className={styles['label']}>项目名称:</div>
                        <div className={styles['input']}>
                            <Input
                                placeholder={'请输入项目名称'}
                                name="projectName"
                                value={state.quotationInfo?.projectName === '未提供' ? '' : (state.quotationInfo?.projectName || '')}
                                onChange={onChangeProductName}
                                disabled={state.isReadOnly}
                            />
                        </div>
                    </div>
                    <div className={styles['row']}>
                        <div className={styles['label']}>是否含税:</div>
                        <div className={styles['input']}>
                            <Switch
                                checkedChildren="含税"
                                unCheckedChildren="不含税"
                                checked={state.includeTax}
                                onChange={onSwitchTax}
                                disabled={state.isReadOnly}
                            />
                        </div>
                    </div>
                </div>
                <div className={styles['body']}>
                    <table className={styles['quotation-table']} >
                        <thead>
                            <tr>
                                <th style={{ width: 120 }}>名称</th>
                                <th style={{ width: 80 }}>品牌</th>
                                <th style={{ width: 150 }}>规格</th>
                                <th style={{ width: 80 }}>价格(元)</th>
                                <th style={{ width: 60 }}>数量</th>
                                <th style={{ width: 40 }}>单位</th>
                                <th style={{ width: 80 }}>小计(元)</th>
                                <th style={{ width: 58 }}>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                (state.quotationInfo?.products || []).map((item, index, self) => {
                                    let productOptions = getCategoryOptions(item) || [],
                                        brandOptions = getBrandOptions(item) || [],
                                        standardOptions = getProductOptions(item) || [];

                                    return (
                                        <tr key={item.productId + '_' + index}>
                                            <td>
                                                <Select
                                                    bordered={false}
                                                    style={{ width: '100%' }}
                                                    placeholder="请选择材料"
                                                    options={productOptions}
                                                    value={item.categoryId || undefined}
                                                    onChange={onChangeCategory.bind(null, index)}
                                                    getPopupContainer={e => e.parentNode}
                                                    disabled={state.isReadOnly}
                                                />
                                            </td>
                                            <td>
                                                <Select
                                                    bordered={false}
                                                    style={{ width: '100%' }}
                                                    placeholder="请选择品牌"
                                                    options={brandOptions}
                                                    value={item.brand || undefined}
                                                    onChange={onChangeBrand.bind(null, index, item.categoryId)}
                                                    getPopupContainer={e => e.parentNode}
                                                    disabled={state.isReadOnly}
                                                />
                                            </td>
                                            <td>
                                                <Select
                                                    bordered={false}
                                                    style={{ width: '100%' }}
                                                    placeholder="请选择材料规格"
                                                    options={standardOptions}
                                                    value={item.productId || undefined}
                                                    onChange={onChangeProduct.bind(null, index)}
                                                    getPopupContainer={e => e.parentNode}
                                                    disabled={state.isReadOnly}
                                                />
                                            </td>
                                            <td>{getUnitPrice(index)}</td>
                                            <td>
                                                <InputNumber
                                                    style={{width:'100%'}}
                                                    bordered={false}
                                                    min={1}
                                                    max={999999}
                                                    controls
                                                    value={item.amount || undefined}
                                                    onChange={onChangeAmount.bind(null, index)}
                                                    disabled={state.isReadOnly}
                                                />
                                            </td>
                                            <td>{getUnitUnit(index)}</td>
                                            <td>{getSubTotalPrice(index)}</td>
                                            <td className={styles['btn-td']}>
                                                { state.isReadOnly ? null : <Tooltip title="移除产品"><Button onClick={removeOne.bind(null, index)} danger shape="circle" size="small" icon={<DeleteOutlined />} /></Tooltip> }
                                                <Tooltip title="查看产品"><Button onClick={viewOne.bind(null, item?.productId)} type="primary" shape="circle" size="small" icon={<EyeOutlined />} /></Tooltip>
                                            </td>
                                        </tr>
                                    );
                                })
                            }
                            {
                                ((state.quotationInfo || {})['products'] || []).length ?
                                    null
                                    :
                                    <tr><td colSpan={8} className={styles['new']}><p>暂未添加产品，可点击左侧分类添加需要的产品</p></td></tr>
                            }
                            <tr>
                                <td colSpan={6} style={{ fontWeight: 600, textAlign: 'left', paddingRight: 24 }}>
                                    <div className={styles['total']}>
                                        报价总计（大写）：<span style={{ fontWeight: 400 }}>{getMoneyText()}</span>
                                    </div>
                                </td>
                                <td colSpan={2}>{getTotalPrice()} 元</td>
                            </tr>
                        </tbody>
                    </table>


                    <table className={styles['remark']}>
                        <thead>
                            <tr>
                                <th>商务解释：</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <Input.TextArea
                                        rows={8}
                                        bordered={false}
                                        placeholder="可输入备注信息"
                                        name="remark"
                                        value={state.quotationInfo?.remark || (state.includeTax ? infoWithTax : infoWithoutTax) || undefined}
                                        onChange={onChangeRemark}
                                        disabled={state.quotationInfo?.status === 30}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <table className={styles['o-info']}>
                        <thead>
                            <tr>
                                <th>收款信息：</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    {
                                        state.includeTax ?
                                            <>
                                                <p>公司名称：成都优嘉贝帝建材有限公司</p>
                                                <p>税号：91510113MA6BR99H6P</p>
                                                <p>电话：13350078088</p>
                                                <p>地址：四川省成都市青白江区八阵大道768号10栋2层</p>
                                                <p>开户银行：中国农业银行股份有限公司青白江支行</p>
                                                <p>账户：22844401040012932</p>
                                            </>
                                            :
                                            <>
                                                <div className={styles['money']}>
                                                    <p>账户名称：彭波</p>
                                                    <p>开户银行：中国农业银行股份有限公司青白江支行</p>
                                                    <p>账户：22844401040012932</p>
                                                    <p>扫码付款：右侧二维码，支持微信，支付宝，信用卡付款；</p>
                                                    <img src={`/images/money.png`} alt="" />
                                                </div>
                                            </>
                                    }
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {
                        state.quotationInfo?.status === 30 ?
                            <table className={styles['other']}>
                                <thead>
                                    <tr>
                                        <th>发货信息：</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <Input.TextArea
                                                rows={8}
                                                bordered={false}
                                                value={state.quotationInfo?.expressInfo}
                                                disabled={state.isReadOnly}
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            :
                            null
                    }

                    <div className={styles['submit']}>
                        <Button onClick={goBack}>返回</Button>
                        {state.quotationInfo.status === 30 || !state.clientId || state.isReadOnly ? null : <Button type="primary" onClick={submit} loading={state.submitting}>提交</Button>}
                    </div>
                </div>
                <div className={styles['footer']}>
                    <span>专属客服：{state.customerServiceName || ''}({state.customerServicePhone || ''})</span>
                    <span>专属业务员：{state.salesmanName || ''}({state.salesmanPhone || ''})</span>
                </div>
            </div>

            <ViewProduct
                open={state.viewOpen}
                productId={state.viewProductId}
                onCancel={e => setState(o => ({ ...o, viewOpen: false, viewProductId: '' }))}
            />
        </div>
    );
}