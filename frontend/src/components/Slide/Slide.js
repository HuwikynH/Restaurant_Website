import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "./Slide.css";
import { Link } from "react-router-dom";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { Autoplay, Pagination, Navigation } from "swiper/modules";

function Slide({ image, title, subtitle, description, link }) {
    return (
        <div className="slide-container">
            <div class="home-text">
                <span>Công thức đặc biệt trong ngày</span>
                <h1>{title}</h1>
                <p>{description}</p>
                <p>Thời gian nấu: {subtitle}</p>
                <Link to={link}>
                    <button type="button" class="btn btn-light btn-check-now">
                        Xem ngay
                    </button>
                </Link>
            </div>

            <img src={image} alt="Slide" />
        </div>
    );
}

export default Slide;
