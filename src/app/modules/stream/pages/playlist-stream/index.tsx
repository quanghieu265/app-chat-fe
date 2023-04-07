import { openNotification } from "@/app/layout/notification";
import services from "@/app/services";
import { storageFB } from "@/firebase/index";
import { InboxOutlined, PlusOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Card, Col, Popconfirm, UploadProps } from "antd";
import { Button, Form, Input, Modal, Upload, UploadFile, message } from "antd";
import Meta from "antd/es/card/Meta";
import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
  uploadString
} from "firebase/storage";
import moment from "moment";
import { useState } from "react";
import { useParams } from "react-router-dom";

const { Dragger } = Upload;
const StreamPlaylistPage = () => {
  let { username } = useParams();
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Queries
  const { data, refetch: refetchPlaylist } = useQuery({
    queryKey: ["playlist", username],
    queryFn: async () => {
      const res = await services.Playlist.getPlaylistByUser(username || "");
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

  const props: UploadProps = {
    name: "file",
    accept: "video/*",
    multiple: false,
    beforeUpload: file => {
      const isVideo = file.type.includes("video/");
      if (!isVideo) {
        message.error(`${file.name} is not a video file`);
      }
      return isVideo || Upload.LIST_IGNORE;
    }
  };

  const onFinish = async (values: { title: string; description: string }) => {
    if (!fileList || fileList.length === 0) {
      return openNotification("error", "Please upload video");
    }
    const file = fileList[0];
    const { title, description } = values;

    const data = {
      title,
      description,
      thumbUrl: file.thumbUrl || "",
      videoUrl: file.url || ""
    };

    const res = await services.Playlist.addNewVideoToPlaylist(data);
    if (res.status === 200) {
      openNotification("success", "Successfully add new video to playlist ");
      handleClose();
      refetchPlaylist();
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  async function getThumbnailForVideo(videoUrl: string) {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    video.style.display = "none";
    canvas.style.display = "none";

    // Trigger video load
    await new Promise<void>((resolve, reject) => {
      video.addEventListener("loadedmetadata", () => {
        video.width = video.videoWidth;
        video.height = video.videoHeight;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        // Get image at specific time
        // video.currentTime = video.duration * 0.25;
        video.currentTime = 0.1;
      });
      video.addEventListener("seeked", () => resolve());
      video.src = videoUrl;
    });

    // Draw the thumbnailz
    canvas
      .getContext("2d")
      ?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    const imageUrl = canvas.toDataURL("image/png");
    return imageUrl;
  }

  const handleUpload = (info: any) => {
    let newFileList = [...info.fileList];
    setFileList(newFileList);
  };

  const uploadVideo = async (options: any) => {
    setLoading(true);
    const { file, onProgress } = options;
    const videoRef = ref(storageFB, `videos/${file.name}`);
    const uploadTask = uploadBytesResumable(videoRef, file);
    uploadTask.on(
      "state_changed",
      snapshot => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress({ percent: progress });
      },
      err => {
        openNotification("error", err.message);
        setLoading(false);
      },
      () => {
        // Upload completed successfully, now we can get the download URL
        getDownloadURL(uploadTask.snapshot.ref).then(async videoUrl => {
          // upload thumbnail from video url
          const fileUrl = URL.createObjectURL(file);
          const thumbUrl = await getThumbnailForVideo(fileUrl);
          const thumbnailRef = ref(storageFB, `thumbnail/${file.name}`);
          uploadString(thumbnailRef, thumbUrl, "data_url").then(snapshot => {
            getDownloadURL(snapshot.ref).then(thumbUrl => {
              file.url = videoUrl;
              file.thumbUrl = thumbUrl;
              setFileList([file]);
              setLoading(false);
            });
          });
        });
      }
    );
  };

  const handleClose = () => {
    setOpen(false);
    form.resetFields();
    setFileList([]);
  };

  console.log("data", data);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center" }}>
        <h1>My Playlist</h1>
        <Button
          onClick={() => {
            setOpen(true);
          }}
          style={{ marginLeft: 8 }}
          type="ghost"
          icon={<PlusOutlined />}
        ></Button>
      </div>

      {(data?.playlist || []).map((i: any, index: number) => {
        return (
          <Col span={6} key={i._id}>
            <Card
              cover={
                <img
                  alt={`video-thumbnail-${index}`}
                  src={i.thumbUrl}
                />
              }
              // extra={
              //   <Popconfirm
              //     title="Delete video"
              //     description="Are you sure to delete this video?"
              //     onConfirm={() => {
              //       // deleteBlogById.mutate(i._id);
              //     }}
              //     okText="Yes"
              //     cancelText="No"
              //   >
              //     <Button type="text">Delete</Button>
              //   </Popconfirm>
              // }
            >
              <Meta
                avatar={<Avatar src={data.avatar_url} />}
                title={i.title}
                description={`${data.username} - ${moment(i.createdAt).fromNow()} `}
              />
            </Card>
          </Col>
        );
      })}

      <Modal
        centered={true}
        open={open}
        onCancel={() => {
          handleClose();
        }}
        footer={null}
      >
        <Form
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          layout={"vertical"}
          form={form}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Please input video title" }]}
          >
            <Input placeholder="Video title" />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Please input video description" }
            ]}
          >
            <Input placeholder="Video description" />
          </Form.Item>

          <Dragger
            fileList={fileList}
            onChange={handleUpload}
            customRequest={uploadVideo}
            {...props}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
          </Dragger>

          <Form.Item
            style={{ display: "flex", justifyContent: "end", marginTop: 8 }}
          >
            <Button
              onClick={handleClose}
              style={{ marginRight: 8 }}
              htmlType="button"
            >
              Cancel
            </Button>
            <Button
              disabled={loading}
              loading={loading}
              type="primary"
              htmlType="submit"
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default StreamPlaylistPage;
