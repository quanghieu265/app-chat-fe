import { notification } from "antd";
import { NotificationPlacement } from "antd/es/notification/interface";

export const openNotification = (
  type: "success" | "warning" | "info" | "error",
  message?: string,
  placement?: NotificationPlacement,
  duration?: number
) => {
  notification[type]({
    message,
    placement: placement || "bottomRight",
    duration: duration || 2,
  });
};
