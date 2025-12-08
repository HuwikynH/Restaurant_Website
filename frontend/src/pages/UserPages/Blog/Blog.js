import React from "react";
import "./Blog.css";

import VideoHeader from "../../../components/VideoHeader/VideoHeader";
import Navigation from "../../../components/Navigation/Navigation";
import AuthorInfo from "../../../components/AuthorInfo/AuthorInfo";
import SocialIcons from "../../../components/SocialIcons/SocialIcons";
import AllStarsSection from "../../../components/AllStarsSection/AllStarsSection";
import FeedbackSection from "../../../components/FeedbackSection/FeedbackSection";
import TikTokVideo from "../../../components/TikTokVideo/TikTokVideo";
import BlogList from "../../../components/BlogList/BlogList";
import chefImage from "../../../assets/imgBlog/chef-smile.jpg";

const Blog = () => {
    return (
        <>
            <VideoHeader />
            <div className="blog-main-container">
                <Navigation />

                <h1 className="title">RATATOUILLE</h1>
                <AuthorInfo />
                <SocialIcons />
                <AllStarsSection />
            </div>

            <h1 className="tiktok-follow-title">Theo dõi chúng tôi tại TikTok</h1>
            <TikTokVideo />

            <div className="blog-cta-container">
                <div className="blog-cta-image">
                    <img src={chefImage} alt="Chef Character" />
                </div>
                <div className="blog-cta-content">
                    <h1>Trở thành khách hàng thân thiết của Ratatouille, và bạn sẽ...</h1>

                    <p>
                        <strong>Luôn được cập nhật:</strong> Nhận thông tin sớm về các set menu mới,
                        ưu đãi theo mùa, sự kiện đặc biệt và chương trình khuyến mãi tại nhà hàng.
                    </p>

                    <p>
                        <strong>Đưa ra ý kiến:</strong> Phản hồi của bạn giúp chúng tôi cải thiện chất
                        lượng món ăn và dịch vụ mỗi ngày. Hãy chia sẻ cảm nhận sau mỗi lần ghé thăm
                        để nhà hàng phục vụ bạn tốt hơn.
                    </p>

                    <p>
                        <strong>Mở rộng mối quan hệ:</strong> Cùng bạn bè, đồng nghiệp hoặc gia đình
                        thưởng thức những bữa tiệc sinh nhật, kỷ niệm, họp mặt trong không gian ấm cúng
                        của Ratatouille.
                    </p>

                    <p>
                        <strong>Lưu giữ khoảnh khắc:</strong> Chia sẻ hình ảnh, câu chuyện về những bữa
                        ăn đáng nhớ tại nhà hàng trên mạng xã hội và cùng chúng tôi lan tỏa tình yêu ẩm
                        thực.
                    </p>

                    <div className="blog-cta-button">
                        <button className="cta-link">Đặt bàn ngay hôm nay</button>
                    </div>
                </div>

                <FeedbackSection />
            </div>

            <BlogList />
        </>
    );
};

export default Blog;
