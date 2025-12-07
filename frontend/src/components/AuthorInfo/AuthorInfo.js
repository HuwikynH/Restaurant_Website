import React from "react";
import imagePopUp from "../../assets/imgBlog/jerry.png";
import "./AuthorInfo.css";

const AuthorInfo = () => {
    return (
        <div className="author-info">
            <div className="author-wrapper">
                <a
                    href="https://www.facebook.com/profile.php?id=61574901281597"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Visit Ratatouille's Facebook profile"
                >
                    <span className="author-name">By Ratatouille</span>
                </a>

                <div className="author-popup" role="tooltip">
                    <img
                        src={imagePopUp}
                        alt="Jerry - Author of Ratatouille"
                        className="author-image"
                    />
                    <h4 className="name-1">Jerry</h4>
                    <p>
                        Jerry là người mang trong mình niềm đam mê sâu sắc với ẩm thực và luôn coi
                        đó là sứ mệnh cuộc đời. Đối với Jerry, mỗi món ăn không chỉ là sự kết hợp
                        của hương vị, mà còn là một phần của văn hóa, lịch sử và con người. Anh sẵn
                        sàng dành thời gian đi đến những vùng quê xa xôi để học hỏi cách nấu ăn
                        truyền thống từ người dân địa phương. Với anh, việc nghiên cứu ẩm thực không
                        dừng lại ở nấu ngon, mà còn là sáng tạo, gìn giữ và kể lại những câu chuyện
                        qua từng món ăn. Jerry luôn chú trọng từng chi tiết nhỏ, từ cách chọn nguyên
                        liệu, chế biến đến trình bày. Anh tin rằng, qua mỗi bữa ăn, con người có thể
                        gần gũi nhau hơn, hiểu nhau hơn, và cùng nhau giữ gìn những giá trị đẹp của
                        ẩm thực dân tộc.
                    </p>
                </div>
            </div>
            <span className="article-date">Updated on June 1, 2025</span>
        </div>
    );
};

export default AuthorInfo;
