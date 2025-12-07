import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const error = params.get("error");

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)",
        fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 32,
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          minWidth: 320,
          maxWidth: "90vw",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: 48, color: "#f87171", marginBottom: 8 }}>
          <span role="img" aria-label="warning">
            ⚠️
          </span>
        </div>
        <h2 style={{ margin: 0, color: "#1e293b", fontWeight: 700 }}>
          Đăng nhập
        </h2>
        {error && (
          <div
            style={{
              color: "#b91c1c",
              background: "#fee2e2",
              border: "1px solid #fca5a5",
              borderRadius: 8,
              padding: "12px 20px",
              margin: "20px 0 16px 0",
              fontWeight: 500,
              textAlign: "center",
              fontSize: 16,
            }}
          >
            {error}
          </div>
        )}
        <button
          onClick={() => navigate("/")}
          style={{
            background: "linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 28px",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(99,102,241,0.08)",
            marginTop: 8,
            transition: "background 0.2s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background =
              "linear-gradient(90deg, #60a5fa 0%, #6366f1 100%)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background =
              "linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)")
          }
        >
          Về trang chủ
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
