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
                    <h1>Trở thành một người dùng Ratatouille, và bạn sẽ...</h1>

                    <p>
                        <strong>Luôn được cập nhật:</strong> Yêu thích thương hiệu của chúng tôi? Là một
                        User, bạn sẽ được xem trước những tính năng, công thức, chương trình khuyến mãi
                        và sản phẩm mới một cách độc quyền, phía sau hậu trường.
                    </p>

                    <p>
                        <strong>Đưa ra ý kiến:</strong> Phản hồi từ cộng đồng tiếp thêm năng lượng cho
                        chúng tôi — dù sao thì, chúng tôi là một nền tảng được tạo ra bởi và dành cho
                        các đầu bếp tại gia. Bạn sẽ có vô số cơ hội để chia sẻ suy nghĩ và góp phần định
                        hình tương lai của chương trình cũng như thương hiệu.
                    </p>

                    <p>
                        <strong>Mở rộng mối quan hệ:</strong> Kết nối với các người dùng trên khắp cả
                        nước, chia sẻ kiến thức nấu ăn, tìm hiểu về cơ hội trong lĩnh vực truyền thông
                        ẩm thực và tham gia các sự kiện cũng như buổi gặp mặt Allstar đặc biệt trong
                        năm.
                    </p>

                    <p>
                        <strong>Phát triển thương hiệu cá nhân:</strong> Là một User và người ảnh hưởng
                        thương hiệu, bạn sẽ thường xuyên xuất hiện trong các chiến dịch quảng bá trên
                        website, kênh tiếp thị và tạp chí Ratatouille của chúng tôi. Tài năng nấu ăn và
                        sự tỏa sáng của bạn sẽ được tiếp cận với hàng chục triệu người.
                    </p>

                    <p>
                        <strong>Kiếm thêm thu nhập:</strong> Đang tìm kiếm một công việc tay trái? Tài
                        năng của bạn trong phát triển công thức, chụp ảnh món ăn, sáng tạo nội dung mạng
                        xã hội hoặc sản xuất video sẽ được ghi nhận qua các dự án tài trợ từ thương
                        hiệu, sự kiện PR và các giải thưởng hàng tháng.
                    </p>

                    <div className="blog-cta-button">
                        <button className="cta-link">Đăng kí để trở thành thành viên</button>
                    </div>
                </div>

                <FeedbackSection />
            </div>

            <BlogList />
        </>
    );
};

export default Blog;
