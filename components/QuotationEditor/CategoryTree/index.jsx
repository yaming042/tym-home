import React, { useEffect, useMemo, useState } from 'react';
import { Input, Tree } from 'antd';
import { tree2array, deepCopy, uniqueArrayById } from '@/utils';
import request from '@/utils/request';
import { QUERY_CATEGORY_TREE } from '@/utils/url';
import styles from './index.module.scss';

const { Search } = Input;
const getParentKey = (key, tree) => {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
        const node = tree[i];
        if (node.children) {
            if (node.children.some((item) => item.key === key)) {
                parentKey = node.key;
            } else if (getParentKey(key, node.children)) {
                parentKey = getParentKey(key, node.children);
            }
        }
    }
    return parentKey;
};
const map2Tree = (array = [], level = 1) => {
    return array.map(item => {
        item.key = item.id;
        item.title = item.name;
        item.level = level;
        item.selectable = (level === 3);

        if (item.children) item.children = map2Tree(item.children, level + 1);

        return item;
    })
};
const array2tree = (array, parentId = 0) => {
    const tree = [];

    for (const item of array) {
        if (item.pid === parentId) {
            const children = array2tree(array, item.key);
            if (children.length) {
                item.children = children;
            }
            tree.push(item);
        }
    }

    return tree;
};
const handleCategoryData = (data = []) => {
    let treeList = deepCopy(data),
        array = tree2array(treeList),
        thirdArray = array.filter(i => i.level === 3),
        result = deepCopy(thirdArray);

    for (let i = 0; i < thirdArray.length; i++) {
        let pid = thirdArray[i].pid,
            p = array.find(o => o.key === pid),
            ppid = p?.pid,
            pp = array.find(o => o.key === ppid);

        p && result.push(p);
        pp && result.push(pp);
    }

    return array2tree(uniqueArrayById(result, 'id'));
};



export default (props) => {
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [autoExpandParent, setAutoExpandParent] = useState(true);
    const [categoryTree, setCategoryTree] = useState([]);
    const [dataList, setDataList] = useState([]);

    // 请求分类数据
    const getCategoryTree = () => {
        request(QUERY_CATEGORY_TREE).then(response => {
            if (response?.code === '0') {
                // 处理数据，只要有三级分类的数据，其他数据丢弃
                let o = handleCategoryData(map2Tree(response?.data || [])),
                    dataList = tree2array(o);

                setCategoryTree(o);
                setDataList(dataList);
            }
        })
    };

    const onExpand = (newExpandedKeys) => {
        setExpandedKeys(newExpandedKeys);
        setAutoExpandParent(false);
    };
    const onChange = (e) => {
        const { value } = e.target;
        const newExpandedKeys = dataList
            .map((item) => {
                if (value && (item.title.indexOf(value) > -1 || (item.alias||'').indexOf(value) > -1)) {
                    return getParentKey(item.key, categoryTree);
                }
                return null;
            })
            .filter((item, i, self) => item && self.indexOf(item) === i);
        setExpandedKeys(newExpandedKeys);
        setSearchValue(value);
        setAutoExpandParent(true);
    };
    const treeData = useMemo(() => {
        const loop = (data) =>
            data.map((item) => {
                const strTitle = item.title;
                const index = strTitle.indexOf(searchValue);
                const beforeStr = strTitle.substring(0, index);
                const afterStr = strTitle.slice(index + searchValue.length);
                const title =
                    index > -1 ? (
                        <span>
                            {beforeStr}
                            <span className="site-tree-search-value">{searchValue}</span>
                            {afterStr}
                        </span>
                    ) : (
                        <span>{strTitle}</span>
                    );
                if (item.children) {
                    return {
                        title,
                        key: item.key,
                        selectable: item.selectable || false,
                        children: loop(item.children),
                    };
                }
                return {
                    title,
                    selectable: item.selectable || false,
                    key: item.key,
                };
            });

        return loop(categoryTree);
    }, [searchValue, categoryTree]);


    useEffect(() => {
        getCategoryTree();

        return () => {
            setCategoryTree([]);
        }
    }, []);

    return (
        <div className={styles['container']}>
            <Search
                style={{ marginBottom: 8 }}
                placeholder="输入关键字进行搜索"
                onChange={onChange}
            />
            <Tree.DirectoryTree
                className={styles['tree']}
                onExpand={onExpand}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                treeData={treeData}
                showIcon={false}
                onSelect={(selectedKeys) => props.onSelect && props.onSelect(selectedKeys)}
                blockNode={true}
            />
        </div>
    );
};
