import React from "react";
import { Outlet } from "react-router-dom";

import "./UserLayout.css";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

function UserLayout({ setShowLogin }) {
  return (
    <div className="user-layout">
      <Navbar setShowLogin={setShowLogin} />
      <Outlet />
      <Footer />
    </div>
  );
}

export default UserLayout;
