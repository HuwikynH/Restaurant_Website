import React from "react";
import huuhuynhImg from "../../assets/imgTeam/huuhuynh.jpg";
import duclocImg from "../../assets/imgTeam/ducloc.jpg";
import tuanminhImg from "../../assets/imgTeam/tuanminh.jpg";
import "./Team.css";

const Team = () => {
  const teamMembers = [
    {
      name: "Nguyễn Hữu Huynh",
      role: "Developer",
      description: "Phụ trách phát triển của dự án",
      image: huuhuynhImg,
    },
    {
      name: "Nguyễn Đức Lộc",
      role: "Leader",
      description: "Dẫn dắt đội ngũ phát triển dự án ",
      image: duclocImg,
    },
    {
      name: "Mai Vũ Tuấn Minh",
      role: "Content Manager",
      description: "Quản lý nội dung dự án",
      image: tuanminhImg,
    },
  ];

  return (
    <div className="team-container">
      <div className="team-content">
        <h2 className="team-title">Đội Ngũ Của Chúng Tôi</h2>
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div className="about-team-member" key={index}>
              <div className="about-member-image">
                <img src={member.image} alt={member.name} />
              </div>
              <div className="about-member-info">
                <h3>{member.name}</h3>
                <h4>{member.role}</h4>
                <p>{member.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Team;
