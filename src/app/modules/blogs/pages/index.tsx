import { openNotification } from "@/app/layout/notification";
import services from "@/app/services";
import { EditOutlined, EllipsisOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Col,
  FloatButton,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row
} from "antd";
import Meta from "antd/es/card/Meta";
import { isEmpty } from "lodash";
import moment from "moment";
import { useCallback, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import "./styles.scss";

const BlogPage = () => {
  let { username } = useParams();
  const queryClient = useQueryClient();

  // Queries
  const {
    status,
    data,
    error,
    refetch: refetchBlogs
  } = useQuery({
    queryKey: ["blogs", username],
    queryFn: async () => {
      const res = await services.Blog.getBlogs(username || "");
      if (res.data) {
        return res.data;
      }
    },
    // refetch call api when focus window
    refetchOnWindowFocus: false,
    // should call api or not?
    enabled: !!username,
    // retry time when failed to call api
    retry: 1
  });

  // Mutations
  const addNewBlog = useMutation({
    mutationFn: async (formData: any) => {
      const res = await services.Blog.addNewBlog(formData);
      if (res.data) {
        return res.data;
      }
    },
    onMutate: variables => {
      // A mutation is about to happen! variables = formData send to POST
      // Trả thêm dữ liệu vào context để dùng ở onError hoặc onSuccess
      return { id: 1 };
    },
    onError: (error, variables, context: any) => {
      // An error happened!
      // console.log(`rolling back optimistic update with id ${context.id}`);
    },
    onSuccess: (data, variables, context) => {
      // Boom baby!
      openNotification("success", "Successfully added new blog");
      handleClose();
      refetchBlogs();
    }
  });

  const deleteBlogById = useMutation({
    mutationFn: async (id: string) => {
      const res = await services.Blog.deleteBlogById(id);
      if (res.data) {
        return res.data;
      }
    },
    onSuccess: (data, variables, context) => {
      // Boom baby!
      openNotification("success", "Successfully delete blog");
      refetchBlogs();
    }
  });

  // Component initialization
  const [open, setOpen] = useState(false);
  const [openRead, setOpenRead] = useState(false);
  const [form] = Form.useForm();
  const editorRef: any = useRef();
  const readRef: any = useRef();

  const onFinish = async (values: any) => {
    if (editorRef.current && editorRef.current.innerHTML !== "") {
      let content = encodeURIComponent(editorRef.current.innerHTML);
      const { title } = values;
      addNewBlog.mutate({ title, content });
    } else {
      return openNotification("error", "Let write some content");
    }
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const renderHtmlContent = useCallback(
    (content: any) => {
      let decodedContent = decodeURIComponent(content);
      let renderEl = document.createElement("div");
      renderEl.innerHTML = decodedContent;

      return (
        <div
          style={{ height: 200 }}
          className="contents"
          dangerouslySetInnerHTML={{ __html: decodedContent }}
        />
      );
    },
    [data]
  );

  return (
    <>
      <FloatButton
        style={{ width: 60, height: 60, marginRight: 24 }}
        icon={<EditOutlined />}
        tooltip={<div>Add new Blog</div>}
        onClick={() => setOpen(!open)}
      />

      {/* Modal add new */}
      <Modal
        title="Add new Blog"
        centered
        open={open}
        footer={null}
        onCancel={handleClose}
        width={1000}
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
          <Form.Item name="content" label="Content">
            <div
              className="editor-blog"
              ref={editorRef}
              contentEditable={true}
            ></div>
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

      {/* Modal read Blog */}
      <Modal
        title={"Blog"}
        forceRender={true}
        open={openRead}
        width={1000}
        footer={null}
        onCancel={() => {
          setOpenRead(false);
        }}
      >
        <div
          ref={readRef}
          style={{ maxHeight: "75vh", overflow: "auto", width: "100%" }}
          className="contents"
        ></div>
      </Modal>

      <Row gutter={[8, 8]}>
        {!isEmpty(data) &&
          (data.post || []).map((i: any, index: number) => {
            return (
              <Col span={6} key={i._id}>
                <Card
                  title={
                    <Meta
                      style={{ padding: "12px 0px" }}
                      avatar={<Avatar src={data.avatar_url} />}
                      title={i.title}
                      description={moment(i.createdAt).format("DD-MM-YYYY")}
                    />
                  }
                  actions={[
                    <EllipsisOutlined
                      onClick={() => {
                        let content = decodeURIComponent(
                          data.post[index].content
                        );
                        if (readRef.current) {
                          readRef.current.innerHTML = content;
                        }
                        setOpenRead(true);
                      }}
                      key="ellipsis"
                    />
                  ]}
                  extra={
                    <Popconfirm
                      title="Delete the blog"
                      description="Are you sure to delete this blog?"
                      onConfirm={() => {
                        deleteBlogById.mutate(i._id);
                      }}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button type="text">Delete</Button>
                    </Popconfirm>
                  }
                >
                  {renderHtmlContent(i.content)}
                </Card>
              </Col>
            );
          })}
      </Row>
    </>
  );
};

export default BlogPage;
