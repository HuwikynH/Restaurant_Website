import { FaBookOpen, FaBullseye } from "react-icons/fa";
import "./VisionMission.css";

const VisionMission = () => {
  const missionPoints = [
    "Mang đến trải nghiệm ẩm thực tinh tế, ấm cúng và thân thiện cho mọi thực khách",
    "Sử dụng nguyên liệu tươi ngon, đảm bảo an toàn và chất lượng trong từng món ăn",
    "Không ngừng cải tiến thực đơn và dịch vụ để phù hợp với nhu cầu khách hàng",
    "Xây dựng đội ngũ nhân viên chuyên nghiệp, tận tâm phục vụ",
    "Góp phần lan toả văn hoá ẩm thực qua những bữa ăn trọn vẹn tại nhà hàng",
  ];

  return (
    <section className="vision-mission">
      <div className="vm-container">
        <div className="vm-card">
          <FaBookOpen className="vm-icon" />
          <h2>Tầm Nhìn</h2>
          <p>
            Trở thành một trong những nhà hàng ẩm thực được yêu thích tại thành phố,
            nơi mỗi bữa ăn là một trải nghiệm trọn vẹn về hương vị, không gian và
            phong cách phục vụ.
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
