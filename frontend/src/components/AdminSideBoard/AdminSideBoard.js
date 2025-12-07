import React from "react";
import { NavLink } from "react-router-dom";

import "./AdminSideBoard.css";
import Logo from "../../assets/img/ratatouille-original.png";
import { FaRegPenToSquare } from "react-icons/fa6";

function AdminSideBoard() {
  const handleLogout = () => {
    localStorage.removeItem("user");
    // Clear user data and reload the app to return to the homepage
    window.location.href = "/";
  };

  return (
    <div className="admin-side-board-wrapper">
      <div className="navigation">
        <div className="logo">
          <img src={Logo} alt="" />
          <i class="bx bx-menu"></i>
        </div>

        <div className="side-bar-wrapper">
          <div className="side-bar-menu">
            <NavLink className="side-bar-link" to="/admin">
              <div className="content">
                <span className="icon">
                  <i className="bx bx-home"></i>
                </span>
                <span className="title">Tổng quan</span>
              </div>
            </NavLink>

            <NavLink className="side-bar-link" to="/adminRecipes">
              <div className="content">
                <span className="icon">
                  <i className="bx bx-detail"></i>
                </span>
                <span className="title">Công thức</span>
              </div>
            </NavLink>

            <NavLink className="side-bar-link" to="adminCategories">
              <div className="content">
                <span className="icon">
                  <i class="bx bx-book-alt"></i>
                </span>
                <span className="title">Danh mục</span>
              </div>
            </NavLink>

            {/* <NavLink className="side-bar-link" to="adminCollections">
                            <div className="content">
                                <span className="icon">
                                    <i className="bx bx-collection"></i>
                                </span>
                                <span className="title">Bộ sưu tập</span>
                            </div>
                        </NavLink> */}

            <NavLink className="side-bar-link" to="adminUsers">
              <div className="content">
                <span className="icon">
                  <i className="bx bx-user-circle"></i>
                </span>
                <span className="title">Người dùng</span>
              </div>
            </NavLink>

            <NavLink className="side-bar-link" to="/adminBookings">
              <div className="content">
                <span className="icon">
                  <i className="bx bx-calendar-event"></i>
                </span>
                <span className="title">Đặt bàn</span>
              </div>
            </NavLink>

            <NavLink className="side-bar-link" to="/adminTables">
              <div className="content">
                <span className="icon">
                  <i className="bx bx-grid-alt"></i>
                </span>
                <span className="title">Sơ đồ bàn</span>
              </div>
            </NavLink>

            <NavLink className="side-bar-link" to="adminBlogs">
              <div className="content">
                <span className="icon">
                  <FaRegPenToSquare className="pen-icon" />
                </span>
                <span className="title">Blog</span>
              </div>
            </NavLink>

            <NavLink className="side-bar-link admin-back-home-btn" to="/">
              <div className="content">
                <span className="icon">
                  <i className="bx bx-globe"></i>
                </span>
                <span className="title">Website</span>
              </div>
            </NavLink>
          </div>
          <button className="side-bar-link logout-btn" onClick={handleLogout}>
            <div className="content">
              <span className="icon">
                <i className="bx bx-exit"></i>
              </span>
              <span className="title">Đăng xuất</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminSideBoard;
