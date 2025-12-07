import React from "react";
import ReactDOM from "react-dom"; // tạo portal để hiển thị menu người dùng tránh bị che khuất

const UserMenuPortal = ({ children }) => {
  return ReactDOM.createPortal(children, document.body);
};

export default UserMenuPortal;
