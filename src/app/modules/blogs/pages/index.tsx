import { RootState } from "@/app/redux/store";
import services from "@/app/services";
import { EditOutlined } from "@ant-design/icons";
import { Button, FloatButton, Form, Input, Modal } from "antd";
import { useState } from "react";
import { useSelector } from "react-redux";

const { TextArea } = Input;

const BlogPage = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    const { title, content } = values;

    const newBlog = await services.Blog.addNewBlog({ title, content });
    console.log(newBlog);
    
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  const onReset = () => {
    form.resetFields();
  };

  const handleClose = () => {
    onReset();
    setOpen(false);
  };

  return (
    <>
      <FloatButton
        style={{ width: 60, height: 60, marginRight: 24 }}
        icon={<EditOutlined />}
        tooltip={<div>Add new Blog</div>}
        onClick={() => setOpen(!open)}
      />
      <Modal
        title="Add new Blog"
        centered
        open={open}
        footer={null}
        onCancel={handleClose}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "You missing title ;')" }]}
          >
            <Input placeholder="Title Blog" />
          </Form.Item>
          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true, message: "Let write some content :)" }]}
          >
            <TextArea rows={4} placeholder="Content Blog" />
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button htmlType="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button htmlType="button" onClick={onReset}>
              Reset
            </Button>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default BlogPage;
