import { setAuthenticated } from "@/app/modules/auth/redux/action";
import { RootState } from "@/app/redux/store";
import services from "@/app/services";
import { storageFB } from "@/firebase/index";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { message, Modal, Upload } from "antd";
import type { RcFile, UploadFile } from "antd/es/upload/interface";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { openNotification } from "../notification";

const ChangeAvatar = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const uploadImage = async (options: any) => {
    const { file } = options;
    try {
      setLoading(true);
      const storageRef = ref(storageFB, file.name);
      const uploadTask = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(uploadTask.ref);
      if (url) {
        file.url = url;
      }
      // set url to file
      setImageUrl(url);
      setFileList([file]);
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must smaller than 2MB!");
    }

    return (isJpgOrPng && isLt2M) || Upload.LIST_IGNORE;
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    if (user.id) {
      setLoading(true);
      const res = await services.Auth.updateUser(user.id, {
        avatar_url: imageUrl
      });

      if (res.data) {
        let newUserData = { ...user, ...res.data };
        localStorage.setItem("user", JSON.stringify(newUserData));
        dispatch(setAuthenticated(newUserData));
        openNotification("success", "Change user avatar successfully");
      }
      setFileList([]);
      setImageUrl("");
      setIsModalOpen(false);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div
        onClick={() => {
          showModal();
        }}
      >
        Change Avatar
      </div>
      <Modal
        title={"Upload your avatar"}
        centered={true}
        open={isModalOpen}
        onOk={handleOk}
        okButtonProps={{ disabled: !imageUrl, loading: loading }}
        onCancel={handleCancel}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column"
          }}
        >
          <div>
            <Upload
              customRequest={uploadImage}
              fileList={fileList}
              name="avatar"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              beforeUpload={beforeUpload}
            >
              {imageUrl ? (
                <div>
                  <img
                    src={imageUrl}
                    alt="avatar"
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>
              ) : (
                uploadButton
              )}
            </Upload>
          </div>

          <p>Allowed Formats: jpeg, gif and png.</p>
        </div>
      </Modal>
    </>
  );
};

export default ChangeAvatar;
