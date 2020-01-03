import React from 'react';
import { Modal, Form, Input, Radio, AutoComplete } from 'antd';

function AddFileModalComponent({visible, onCancel, onCreate, form}) {
  const [folders, setFolders] = React.useState([]);
  const { getFieldDecorator } = form;

  React.useEffect(() => {
    fetch('/folders').then(async (data) => {
      const jsonData = await data.json();
      setFolders(jsonData.data);
    })
  }, [visible]);

  return (
    <Modal
      visible={visible}
      title="Form within a Modal"
      okText="Submit"
      onCancel={onCancel}
      onOk={onCreate}
    >
      <Form layout="vertical">
      <Form.Item>
          {getFieldDecorator('type', {
            initialValue: 'tv-show',
          })(
            <Radio.Group>
              <Radio value="tv-show">TV SHOW</Radio>
              <Radio value="movies">MOVIES</Radio>
            </Radio.Group>
          )}
        </Form.Item>
        <Form.Item label="Folder name">
          {getFieldDecorator('folder', {
            initialValue: 'test',
            validateTrigger: ['onChange'],
            rules: [{ required: true, message: 'Please input folder name' }]
          })(
            <AutoComplete
              dataSource={folders}
              onChange={(value) => form.setFieldsValue({folder: value})}
              filterOption={(inputValue, option) =>
                option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
              }
            />
          )}
        </Form.Item>
        <Form.Item label="Torrent link">
          {getFieldDecorator('link', {
            initialValue: 'magnet:?xt=urn:btih:32b6f9cd9c2e90c3d1b8eed82b52ed3ae8dbff84&dn=Silicon.Valley.S06E07.720p.WEB.x265-MiNX%5BTGx%5D&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969',
            rules: [{ required: true, message: 'Please input torrent link!' }]
          })(<Input />)}
        </Form.Item>
      </Form>
    </Modal>
  );
}

const AddFileModal = Form.create({ name: 'modal_form' })(AddFileModalComponent);

export default AddFileModal;
