import { FaUtensils, FaUsers } from "react-icons/fa";
import { MdRestaurantMenu, MdOutlineRateReview } from "react-icons/md";
import "./Features.css";

const Features = () => {
  const features = [
    {
      icon: <FaUtensils />,
      title: "Thư Viện Công Thức",
      description:
        "Hơn 1000+ công thức nấu ăn đa dạng từ truyền thống đến hiện đại, được cập nhật thường xuyên.",
    },
    {
      icon: <MdRestaurantMenu />,
      title: "Hệ Thống Tìm Kiếm",
      description:
        "Tìm kiếm thông minh theo nguyên liệu, thời gian nấu, độ khó và nhiều tiêu chí khác.",
    },
    {
      icon: <FaUsers />,
      title: "Cộng Đồng",
      description:
        "Kết nối với cộng đồng yêu nấu ăn, chia sẻ công thức và kinh nghiệm.",
    },
    {
      icon: <MdOutlineRateReview />,
      title: "Đánh Giá & Bình Luận",
      description:
        "Hệ thống đánh giá và bình luận giúp bạn chọn lọc những công thức tốt nhất.",
    },
  ];

  return (
    <section className="features-section">
      <h2 className="section-title">Các Tính Năng Chính</h2>
      <div className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
