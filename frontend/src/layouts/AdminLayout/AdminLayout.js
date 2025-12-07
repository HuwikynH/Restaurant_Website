import React from "react";
import { Outlet } from "react-router-dom";

import "./AdminLayout.css";
import AdminSideBoard from "../../components/AdminSideBoard/AdminSideBoard";

function AdminLayout() {
    return (
        <div className="admin-layout">
            <AdminSideBoard />
            <div className="admin-content">
                <Outlet />
            </div>
        </div>
    );
}

export default AdminLayout;
