import React, { useEffect, useState, useRef } from "react";
import "./Achievements.css";
import { FaUsers, FaUtensils, FaStar, FaHeart } from "react-icons/fa";

const Achievement = ({ icon, number, text }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      const duration = 2000; // 2 seconds
      const steps = 50;
      const stepValue = number / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += stepValue;
        if (current >= number) {
          setCount(number);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isVisible, number]);

  return (
    <div className="achievement-item" ref={ref}>
      {icon}
      <h3>{count.toLocaleString()}+</h3>
      <p>{text}</p>
    </div>
  );
};

const Achievements = () => {
  const achievements = [
    {
      icon: <FaUsers className="achievement-icon" />,
      number: 50000,
      text: "Thành viên",
    },
    {
      icon: <FaUtensils className="achievement-icon" />,
      number: 1000,
      text: "Công thức",
    },
    {
      icon: <FaStar className="achievement-icon" />,
      number: 25000,
      text: "Đánh giá 5 sao",
    },
    {
      icon: <FaHeart className="achievement-icon" />,
      number: 100000,
      text: "Lượt thích",
    },
  ];

  return (
    <section className="achievements-section">
      <div className="achievements-overlay"></div>
      <div className="achievements-content">
        <h2>Những Con Số Ấn Tượng</h2>
        <div className="achievements-grid">
          {achievements.map((achievement, index) => (
            <Achievement key={index} {...achievement} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Achievements;
