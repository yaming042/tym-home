// tree结构转数组
export const tree2array = (treeArray = [], parentId = null) => {
    const flatArray = [];

    for (const node of treeArray) {
        const flatNode = {
            pid: parentId, // 父节点的 id
            ...node,// 其他节点属性...
        };

        flatArray.push(flatNode);

        if (node.children && node.children.length > 0) {
            flatArray.push(...tree2array(node.children, node.key)); // 传递当前节点的 id 作为父节点的 pid
        }
    }

    return flatArray;
};

// 获取指定pathname的路由，对应的菜单路径
export const getMenuPath = (id = '', list = []) => {
    let result = [],
        limit = list.length * 2;
    while (id && limit > 0) {
        limit--;

        let obj = list.find(i => i.key === id);

        if (obj) {
            result.unshift(obj);

            id = obj.pid;
        }
    }

    return result;
};

// 判断两个数组元素是否一样
export const arrayItemEqual = (arr1 = [], arr2 = []) => {
    if (arr1.length !== arr2.length) return false;
    if (!arr1.length && arr1.length === arr2.length) return true;

    const set1 = new Set(arr1);

    for (const element of arr2) {
        if (!set1.has(element)) return false;
    }

    return true;
}

// 深拷贝
export const deepCopy = (obj, cache = new WeakMap()) => {
    // 检查是否已经拷贝过，防止循环引用
    if (cache.has(obj)) return cache.get(obj);

    // 处理特殊类型
    if (obj === null || typeof obj !== 'object') return obj;

    // 处理日期对象
    if (obj instanceof Date) return new Date(obj);

    // 处理正则表达式对象
    if (obj instanceof RegExp) return new RegExp(obj);

    // 创建一个空的对象或数组，具有相同的原型
    const copy = Array.isArray(obj) ? [] : {};

    // 将新对象/数组存入缓存，以防止循环引用
    cache.set(obj, copy);

    // 递归拷贝子属性
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            copy[key] = deepCopy(obj[key], cache);
        }
    }

    return copy;
}


// 数组对象去重
export const uniqueArrayById = (array, key) => {
    const uniqueMap = new Map();

    for (const item of array) {
        const keyValue = item[key];

        if (!uniqueMap.has(keyValue)) uniqueMap.set(keyValue, item);
    }

    return Array.from(uniqueMap.values());
};

// 数组取交集
export const findIntersection = (arr1, arr2) => {
    // 使用 Set 数据结构来存储 arr1 中的元素
    const set1 = new Set(arr1);

    // 使用 filter 方法遍历 arr2，筛选出同时存在于 set1 和 arr2 中的元素
    const intersection = arr2.filter(element => set1.has(element));

    return intersection;
}

// 获取图片base64格式
export const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

// 字符串hash处理
export const string2Hash = (str) => {
    let hash = 0;

    if (str.length === 0) return hash;

    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
    }

    return hash;
}

// 从字符串中获取指定的参数
export const getParameterByName = (name, url = '') => {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&'); // 处理特殊字符
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// 防抖函数
export const debounceHandle = (func, delay) => {
    let timeoutId;

    return function (...args) {
        const context = this;

        clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    };
}

// 金钱类，输入数字输出中文大写
export const numberToChinese = (number) => {
    // 定义数字和单位的对应关系
    const digits = "零壹贰叁肆伍陆柒捌玖";
    const units = ["元", "角", "分", "整"];
    const powers = ["", "拾", "佰", "仟"];

    // 处理小数部分，保留两位小数
    number = parseFloat(number).toFixed(2);

    // 分离整数部分和小数部分
    const parts = number.split(".");
    const integerPart = parts[0];
    const decimalPart = parts[1];

    // 将整数部分转换为中文大写
    let result = "";
    let zeroFlag = false; // 是否已经有零
    for (let i = 0; i < integerPart.length; i++) {
        const digit = parseInt(integerPart[i]);
        const position = integerPart.length - i - 1;

        if (digit === 0) {
            zeroFlag = true;
            continue;
        }

        if (zeroFlag) {
            result += digits[0]; // 添加零
            zeroFlag = false;
        }

        result += digits[digit] + powers[position % 4];
    }

    if (result === "") {
        result = digits[0] + units[0]; // 处理零元的情况
    } else {
        result += units[0]; // 添加元
    }

    // 将小数部分转换为中文大写
    if (decimalPart) {
        for (let i = 0; i < decimalPart.length; i++) {
            const digit = parseInt(decimalPart[i]);
            if (digit !== 0) {
                result += digits[digit] + units[i + 1];
            }
        }
    } else {
        result += units[3]; // 添加整
    }

    return result;
}

// 生成uuid
export const getUuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// 除法
export const divideAndRound = (dividend, divisor, decimalPlaces=6) => {
    if (divisor === 0) {
        console.log(`非法表达式`);
        return null;
    }

    // 执行除法操作
    const result = dividend / divisor;

    // 四舍五入到指定小数位数
    const roundedResult = Math.round(result * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);

    return roundedResult;
}


export const emailReg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
export const mobileReg = /^((13[0-9])|(14[0-9])|(15([0-9]))|(16[0-9])|(17[0-9])|(18[0-9])|(19[0-9]))\d{8}$/;



export const clientLevel = [
    {value: '3', label: '游客'},
    {value: '1', label: '施工方'},
    {value: '2', label: '建材商'},
];