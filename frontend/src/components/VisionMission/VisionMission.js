import { FaBookOpen, FaBullseye } from "react-icons/fa";
import "./VisionMission.css";

const VisionMission = () => {
  const missionPoints = [
    "Cung cấp nguồn công thức nấu ăn đa dạng, chất lượng và đáng tin cậy",
    "Xây dựng cộng đồng chia sẻ kiến thức và đam mê ẩm thực",
    "Bảo tồn và phát triển các món ăn truyền thống",
    "Hỗ trợ người dùng phát triển kỹ năng nấu ăn",
    "Tạo ra không gian sáng tạo và truyền cảm hứng trong ẩm thực",
  ];

  return (
    <section className="vision-mission">
      <div className="vm-container">
        <div className="vm-card">
          <FaBookOpen className="vm-icon" />
          <h2>Tầm Nhìn</h2>
          <p>
            Trở thành nền tảng ẩm thực hàng đầu, nơi mỗi người có thể khám phá
            niềm vui nấu ăn và chia sẻ đam mê ẩm thực. Chúng tôi cam kết mang
            đến những trải nghiệm nấu ăn tuyệt vời và kết nối cộng đồng yêu ẩm
            thực.
          </p>
        </div>
        <div className="vm-card">
          <FaBullseye className="vm-icon" />
          <h2>Sứ Mệnh</h2>
          <ul className="mission-list">
            {missionPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default VisionMission;
