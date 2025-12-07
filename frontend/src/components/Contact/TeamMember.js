import React from "react";
import "./TeamMember.css";
import huuhuynhImg from "../../assets/imgTeam/huuhuynh.jpg";
import duclocImg from "../../assets/imgTeam/ducloc.jpg";
import tuanminhImg from "../../assets/imgTeam/tuanminh.jpg";

const teamData = [
    {
        name: "Nguyễn Hữu Huynh",
        image: huuhuynhImg,
        position: "Developer",
        // description: "Phụ trách phát triển back-end và front-end của dự án",
        phone: "+84 123 456 789",
        email: "huuhuynh@example.com",
    },
    {
        name: "Nguyễn Đức Lộc",
        image: duclocImg,
        position: "Leader",
        // description: "Phụ trách thiết kế giao diện và trải nghiệm người dùng",
        phone: "+84 38 314 8283",
        email: "nguyenducloc.dalat@gmail.com",
    },
    {
        name: "Mai Vũ Tuấn Minh",
        image: tuanminhImg,
        position: "Content Manager",
        // description: "Phụ trách quản lý và phát triển nội dung",
        phone: "+84 456 789 123",
        email: "tuanminh@example.com",
    },
];

const TeamMember = () => {
    return (
        <div className="team-section">
            <h2>Đội Ngũ Của Chúng Tôi</h2>
            <div className="team-grid">
                {teamData.map((member, index) => (
                    <div key={index} className="team-member">
                        <div className="member-image">
                            <img src={member.image} alt={member.name} />
                        </div>
                        <div className="member-info">
                            <h3>{member.name}</h3>
                            <div className="position">{member.position}</div>
                            <div className="member-contact">
                                <div className="contact-item">
                                    <p>{member.phone}</p>
                                </div>
                                <div className="contact-item">
                                    <p>{member.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeamMember;
