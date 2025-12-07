import React from "react";
import "./AboutUs.css";
import Project from "../../../components/Project/Project";
import VisionMission from "../../../components/VisionMission/VisionMission";
import Features from "../../../components/Features/Features";
import Team from "../../../components/Team/Team";
import Achievements from "../../../components/Achievements/Achievements";
import { NavLink } from "react-router-dom";

const AboutUs = () => {
    return (
        <div className="about-container">
            <div className="about-us-header">
                <div className="header-content">
                    <h1>Dự Án Ratatouille</h1>
                    <h2 className="tagline">Nơi Đam Mê Gặp Gỡ Hương Vị</h2>
                    <p className="intro-text">
                        Ratatouille là một nền tảng ẩm thực trực tuyến, nơi kết nối những người đam
                        mê nấu ăn và khám phá ẩm thực từ khắp nơi trên thế giới. Dự án của chúng tôi
                        không chỉ là một trang web công thức nấu ăn thông thường, mà còn là một cộng
                        đồng nơi mọi người có thể chia sẻ, học hỏi và phát triển đam mê ẩm thực của
                        mình.
                    </p>
                    <div className="cta-buttons">
                        <NavLink to="/recipes" className="cta-button primary">
                            Khám phá công thức
                        </NavLink>
                        <NavLink to="/contact" className="cta-button primary">
                            Liên hệ với chúng tôi
                        </NavLink>
                    </div>
                </div>
            </div>
            <div className="about-content">
                <Project />
                <Achievements />
                <Features />
                <VisionMission />
                <Team />
            </div>
        </div>
    );
};

export default AboutUs;
