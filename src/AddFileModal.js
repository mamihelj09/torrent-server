import React from "react";
import { Modal, Form, Input, Radio, AutoComplete } from "antd";

function AddFileModalComponent({ visible, onCancel, onCreate, form }) {
  const [folders, setFolders] = React.useState([]);
  const { getFieldDecorator } = form;

  React.useEffect(() => {
    fetch("/folders").then(async data => {
      const jsonData = await data.json();
      setFolders(jsonData.data);
    });
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
          {getFieldDecorator("type", {
            initialValue: "tv-show"
          })(
            <Radio.Group>
              <Radio value="tv-show">TV SHOW</Radio>
              <Radio value="movies">MOVIES</Radio>
            </Radio.Group>
          )}
        </Form.Item>
        <Form.Item label="Folder name">
          {getFieldDecorator("folder", {
            initialValue: "",
            validateTrigger: ["onChange"],
            rules: [{ required: true, message: "Please input folder name" }]
          })(
            <AutoComplete
              dataSource={folders}
              onChange={value => form.setFieldsValue({ folder: value })}
              filterOption={(inputValue, option) =>
                option.props.children
                  .toUpperCase()
                  .indexOf(inputValue.toUpperCase()) !== -1
              }
            />
          )}
        </Form.Item>
        <Form.Item label="Torrent link">
          {getFieldDecorator("link", {
            initialValue: "",
            rules: [{ required: true, message: "Please input torrent link!" }]
          })(<Input />)}
        </Form.Item>
      </Form>
    </Modal>
  );
}

const AddFileModal = Form.create({ name: "modal_form" })(AddFileModalComponent);

export default AddFileModal;
