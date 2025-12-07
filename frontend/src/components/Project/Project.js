import React from "react";
import "./Project.css";
import { FaCode, FaUsers, FaLightbulb, FaHeart } from "react-icons/fa";
import { motion } from "framer-motion";

const Project = () => {
  const fadeInUp = {
    initial: { y: 50, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.6 },
  };

  const features = [
    {
      icon: <FaCode />,
      title: "Công Nghệ Hiện Đại",
      description:
        "Sử dụng React và các công nghệ web tiên tiến nhất để mang lại trải nghiệm mượt mà cho người dùng.",
    },
    {
      icon: <FaUsers />,
      title: "Cộng Đồng Sôi Động",
      description:
        "Kết nối hàng nghìn người yêu ẩm thực, chia sẻ công thức và kinh nghiệm nấu ăn.",
    },
    {
      icon: <FaLightbulb />,
      title: "Sáng Tạo Không Giới Hạn",
      description:
        "Khuyến khích người dùng sáng tạo và thể hiện phong cách ẩm thực riêng của mình.",
    },
    {
      icon: <FaHeart />,
      title: "Đam Mê & Tận Tâm",
      description:
        "Được phát triển bởi những người yêu ẩm thực và công nghệ, với mục tiêu mang đến trải nghiệm tốt nhất.",
    },
  ];

  return (
    <div className="project-container">
      <motion.div
        className="project-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="project-header">
          <motion.h2
            className="project-title"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Về Dự Án Của Chúng Tôi
          </motion.h2>
          <motion.div
            className="project-description"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p>
              Ratatouille không chỉ là một website công thức nấu ăn thông
              thường. Chúng tôi là một nền tảng kết nối những người đam mê ẩm
              thực, nơi bạn có thể khám phá, học hỏi và chia sẻ niềm đam mê nấu
              nướng của mình.
            </p>
          </motion.div>
        </div>

        <div className="project-features">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-item"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
              }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="project-cta"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="cta-content">
            <h3>Bạn Muốn Tham Gia Cùng Chúng Tôi?</h3>
            <p>
              Hãy trở thành một phần của cộng đồng Ratatouille ngay hôm nay!
            </p>
            <button className="cta-button">Tham Gia Ngay</button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Project;
