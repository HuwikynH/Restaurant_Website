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
                    <h1>Nhà Hàng Ratatouille</h1>
                    <h2 className="tagline">Nơi Đam Mê Gặp Gỡ Hương Vị</h2>
                    <p className="intro-text">
                        Ratatouille là một nhà hàng ẩm thực nơi khách hàng có thể đặt bàn, lựa chọn
                        thực đơn và tận hưởng trải nghiệm ăn uống trọn vẹn cùng gia đình, bạn bè.
                        Hệ thống đặt bàn trực tuyến của chúng tôi giúp bạn chủ động chọn chi nhánh,
                        thời gian, không gian bàn và các set menu phù hợp trước khi đến nhà hàng.
                    </p>
                    <div className="cta-buttons">
                        <NavLink to="/booking" className="cta-button primary">
                            Đặt bàn ngay
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
