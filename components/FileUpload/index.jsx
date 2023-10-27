import { useState, useEffect } from "react";
import { Upload, Modal } from "antd";
import { PlusOutlined } from '@ant-design/icons';

const UploadButton = (props) => {
    return (
        <div className="upload_btn">
            <PlusOutlined />
            <div style={{marginTop: 8}}>{props.placeholder || '上传'}</div>
        </div>
    )
}
const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

export default (props) => {
    const initState = () => ({
            previewOpen: false,
            previewImage: '',
            previewTitle: '',
            fileList: props.value || [],
            action: props.action || '',
            limit: props.limit || 9,
            multiple: props.multiple || false,
        }),
        [state, setState] = useState(initState);

    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }

        setState(o => ({
            ...o,
            previewOpen: true,
            previewImage: file.url || file.preview,
            previewTitle: file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
        }));
    }
    const handleChange = ({ fileList: newFileList }) => {
        setState(o => ({...o, fileList: newFileList}));

        let doneItems = newFileList.filter(i => i.status === 'done'),
            errorItems = newFileList.filter(i => i.status === 'error');

        if(doneItems.length + errorItems.length === newFileList.length) {
            let images = (newFileList || []).map(item => {
                return item?.status === 'done' ? {uid: item.uid, status: item.status, url: item?.response?.data ? item?.response?.data[0] : item.url, name: item.name} : null
            }).filter(Boolean);

            props.onChange && props.onChange(images);
        }
    }
    const handleCancel = () => {
        setState(o => ({...o, previewOpen: false}));
    }

    useEffect(() => {
        setState(o => ({...o, fileList: props.value}))
    }, [props.value]);

    return (
        <>
            <Upload
                name="files"
                accept={props.accept || ''}
                action={state.action}
                listType="picture-card"
                multiple={state.multiple}
                fileList={state?.fileList || []}
                onPreview={handlePreview}
                onChange={handleChange}
                maxCount={state.limit || 1}
            >
                { state?.fileList?.length >= (state.multiple ? state.limit : 1) ? null : <UploadButton placeholder={props.placeholder || ''} /> }
            </Upload>

            <Modal
                open={state?.previewOpen}
                title={state?.previewTitle}
                footer={null}
                onCancel={handleCancel}
            >
                <img alt={state?.previewTitle} style={{width: '100%'}} src={state?.previewImage} />
            </Modal>
        </>
    );
};