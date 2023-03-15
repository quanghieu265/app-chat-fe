import axios from "axios";

const requestHeader = {
  Accept: "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers":
    "Origin,Authorization,Content-Type,Accept,User-Agent,Cache-Control,Keep-Alive,X-Requested-With,If-Modified-Since"
};

const axiosConfig = {
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:5000/api"
      : process.env.REACT_APP_BACKEND_URL + "/api",
  header: requestHeader,
  withCredentials: true,
  credentials: "include"
};

const axiosInstance = axios.create(axiosConfig);

axiosInstance.interceptors.request.use(
  // Do something before request is sent
  async (config: any) => {
    let user = localStorage.getItem("user");
    if (user) {
      let { token } = JSON.parse(user);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  // Do something with request error
  error => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  response => {
    return response;
  },
  function (error) {
    if (error.response.status === 401) {
      localStorage.clear();
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
