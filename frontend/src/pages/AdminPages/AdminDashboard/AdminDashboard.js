import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";
import axios from "axios";

function AdminDashboard() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        // Lấy top viewed từ product-service (DB mới)
        const res = await axios.get(
          `${process.env.REACT_APP_PRODUCT_API_URL}/api/recipes/top-viewed`
        );

        const mapped = (res.data || []).map((r) => ({
          ...r,
          likes: Array.isArray(r.favorites) ? r.favorites.length : 0,
          commentCount: Array.isArray(r.comments) ? r.comments.length : 0,
          overviewScore: typeof r.rating === "number" ? r.rating : 0,
        }));

        setRecipes(mapped);
      } catch (err) {
        setError("Lỗi khi tải dữ liệu tổng quan");
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  return (
    <div className="admin-dashboard-wrapper">
      <h2>Các công thức đang xu hướng</h2>
      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <div className="overview-table-container">
          <table className="overview-table">
            <thead>
              <tr>
                <th>TOP</th>
                <th>Tên công thức</th>
                <th>Người tạo</th>
                <th>Lượt xem</th>
                <th>Yêu thích</th>
                <th>Bình luận</th>
                <th>Điểm tổng quan</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((r, idx) => (
                <tr key={r._id}>
                  <td>{idx + 1}</td>
                  <td>{r.title}</td>
                  <td>{r.createdBy?.username || "Admin"}</td>
                  <td>{r.views}</td>
                  <td>{r.likes}</td>
                  <td>{r.commentCount}</td>
                  <td>{r.overviewScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
