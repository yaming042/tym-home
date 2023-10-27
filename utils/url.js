export const SUBMIT_LOGIN = `/api/admin/login`;
export const SEND_CAPTCHA = `/api/client/sms/login-send`;
export const SUBMIT_LOGIN_PHONE = `/api/client/login`;
export const LOGOUT = `/api/client/logout`;
export const CLIENT_REG = `/api/client/regist`;

export const QUERY_CATEGORY_TREE = `/api/client/category/categoryTree`; // 查询分类树
export const QUERY_CATEGORY_INFO = `/api/client/category/{categoryId}/images`; // 获取三级分类详情

export const QUERY_QUOTATION_LIST_PAGE = `/api/client/quotation/pages`; // 报价单列表
export const QUERY_USER_INFO = `/api/client/loginUserInfo`; // 获取用户信息
export const UPDATE_USER_INFO = `/api/client/updateInfo`; // 更新用户信息(或 注册)

export const QUERY_PRODUCT_BY_CATEGORY_ID = `/api/client/product/categorys`; // 根据分类id查询所有规格
export const QUERY_QUOTATION_INFO = `/api/client/quotation/{quotationId}/quotation-detail`; // 查询报价单详情

export const MONEY_CALC = `/api/client/quotation/calc`; // 重新计价
export const ADD_QUOTATION = `/api/client/quotation`; // 新增报价单
export const GET_QUOTATION_ID = `/api/client/quotation/code`; // 获取报价单id

export const QUERY_PRODUCT_INFO = `/api/client/product/{productId}`; // 查询产品详情，在报价单出弹框可查看产品详情

export const OAUTH2_CALLBACK_URL = `/api/client/wx/getUnionid`; // 根据code获取uuid
export const OAUTH2_SEND_CAPTCHA = `/api/client/sms/login-send`; // 绑定手机时发送验证码
export const OAUTH2_BIND_PHONE = `/api/client/wx/bind`; // uuid和手机绑定