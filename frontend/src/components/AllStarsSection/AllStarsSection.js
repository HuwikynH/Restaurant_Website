import React from "react";
import imageBlog4 from "../../assets/imgBlog/Leslie.jpg";
import "./AllStarsSection.css";

const AllStarsSection = () => {
    return (
        <div className="blog-all-stars-container">
            <h1 className="all-stars-title">Home Cooks Are Our Heroes</h1>
            <div className="all-stars-content">
                <div className="image-section">
                    <img
                        src={imageBlog4}
                        alt="Leslie from MasterChef - Home Cook Hero"
                        className="all-stars-image"
                        loading="lazy"
                    />
                    <p className="image-credit">PHOTO: Leslie from MasterChef</p>
                </div>
                <div className="text-section">
                    <p>
                        Những người có ảnh hưởng trên mạng xã hội, các chuyên gia dinh dưỡng được
                        cấp phép, và các bậc thầy nướng thịt dày dạn kinh nghiệm—Ratatouille là một
                        đội ngũ đa dạng, yêu ẩm thực, trải dài trên khắp nước  và đại diện cho
                        nhiều nền văn hóa, sắc tộc cũng như kiểu mẫu gia đình khác nhau. Từ việc lập
                        kế hoạch bữa ăn, mua sắm thực phẩm thông minh, theo kịp các xu hướng nấu ăn
                        theo mùa cho đến những mẹo tổ chức tiệc tài tình, nhóm người dùng đầy tâm
                        huyết này thường xuyên được mời chia sẻ kiến thức chuyên môn của họ.
                    </p>
                    <p>
                        Kể từ năm 2011, nhóm Ratatouille đã tạo ra hàng chục nghìn công thức nấu ăn,
                        hình ảnh và bài đánh giá gốc, đồng thời chia sẻ kiến thức nấu nướng của họ
                        thông qua nội dung đa phương tiện trên trang web của chúng tôi, mạng xã hội
                        và nhiều kênh tiếp thị khác. Nói ngắn gọn, Ratatouille giúp mọi hành trình
                        nấu ăn tại nhà của chúng ta trở nên thành công hơn.
                    </p>
                    <p>
                        Leslie Gilliams, người bạn thấy bên trái, là "ông vua của ẩm thực" với khả
                        năng nấu nướng tài tình. Hãy học những mẹo tiếp khách đã được kiểm chứng của
                        ông ấy để biến chúng thành bí quyết của riêng bạn. Cần một bữa ăn nhanh?
                        Leslie Gilliams sẽ trổ tài với món gà sốt kem chỉ với 3 nguyên liệu yêu
                        thích của ông ấy ngay bên dưới.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AllStarsSection;
