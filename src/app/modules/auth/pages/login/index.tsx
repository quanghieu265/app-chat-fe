import { Button, Checkbox, Form, Input } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { RootState } from "../../../../redux/store";
import { loginSaga } from "../../redux/action";
import "./style.scss";
import services from "@/app/services";

const LoginPage: React.FC = () => {
  const [data, setData] = useState([]);

  const dispatch = useDispatch();
  let navigate = useNavigate();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const onFinish = (values: any) => {
    dispatch(loginSaga(values));
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  const handleGetUsersInfo = async () => {
    const res = await services.Auth.getUsersInfo();

    if (res.status === 200 && res.data) {
      setData(res.data);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      return navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
      <div className="login-page">
        <div className="login-box">
          <div className="illustration-wrapper">
            <img
              src="https://mixkit.imgix.net/art/preview/mixkit-left-handed-man-sitting-at-a-table-writing-in-a-notebook-27-original-large.png?q=80&auto=format%2Ccompress&h=700"
              alt="Login"
            />
          </div>
          <Form
            id={"login-form"}
            name="login-form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >
            <p className="form-title">Welcome back</p>
            <p>Login to the Dashboard</p>
            <Form.Item
              name="username"
              rules={[
                { required: true, message: "Please input your username!" }
              ]}
            >
              <Input placeholder="Username" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your password!" }
              ]}
            >
              <Input.Password placeholder="Password" />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked">
              <Checkbox>Remember me</Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
              >
                LOGIN
              </Button>
            </Form.Item>
            <div>
              Or <Link to="/auth/register">register now!</Link>
            </div>

            <Button onClick={handleGetUsersInfo}>Get Users Info</Button>
            <p style={{ overflowWrap:"break-word"}}>
              {JSON.stringify(data)}
            </p>
          </Form>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
