import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Slide from "../Slide/Slide";
import "./BigSwiper.css";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { Autoplay, Pagination, Navigation } from "swiper/modules";

import Slide1 from "../../assets/img/slide1.webp";
import Slide2 from "../../assets/img/slide2.webp";
import Slide3 from "../../assets/img/slide3.webp";
import BackGroundImage from "../../assets/img/background.jpg";

function BigSwiper({ recipeList }) {
    return (
        <div className="big-swiper-wrapper" id="big-swiper">
            <Swiper
                spaceBetween={30}
                centeredSlides={true}
                autoplay={{
                    delay: 4500,
                    disableOnInteraction: false,
                }}
                pagination={{
                    clickable: true,
                }}
                navigation={true}
                modules={[Autoplay, Pagination, Navigation]}
                className="mySwiper"
            >
                {recipeList.map(
                    (recipe) =>
                        recipe && (
                            <SwiperSlide
                                key={recipe._id}
                                style={{
                                    backgroundImage: `url(${BackGroundImage})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    backgroundRepeat: "no-repeat",
                                }}
                            >
                                <Slide
                                    image={recipe.imageThumb}
                                    title={recipe.title}
                                    subtitle={recipe.cookingTime}
                                    description={recipe.description}
                                    link={`/recipes/${recipe._id}`}
                                />
                            </SwiperSlide>
                        )
                )}
            </Swiper>
        </div>
    );
}

export default BigSwiper;
