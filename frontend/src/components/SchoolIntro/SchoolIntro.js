import React from "react";
import "./SchoolIntro.css";
import ptitImage from "../../assets/img/ptit.jpg";

const SchoolIntro = () => {
    const stats = [
        {
            number: "25+",
            label: "Năm Từ Khi Thành Lập",
        },
        {
            number: "2",
            label: "Cơ Sở Đào Tạo Tại TP.HCM",
        },
        {
            number: "10+",
            label: "Ngành Đào Tạo",
        },
    ];

    return (
        <section className="school-intro">
            <div className="school-container">
                <div className="school-content">
                    <div className="school-info">
                        <div className="school-pride">Chúng tôi tự hào khi là học viên của</div>
                        <h2>
                            Học viện Công nghệ <br />
                            Bưu chính Viễn thông
                        </h2>
                        <div className="school-subtitle">
                            Posts and Telecommunications Institute of Technology (PTIT)
                        </div>
                        <p>
                            Học viện Công nghệ Bưu chính Viễn thông cơ sở tại TP.HCM, được thành lập
                            từ năm 1997, là một trong những cơ sở đào tạo uy tín trong lĩnh vực công
                            nghệ thông tin, viễn thông và truyền thông tại Việt Nam. PTIT không
                            ngừng phát triển và đổi mới, mang đến môi trường học tập hiện đại,
                            chuyên nghiệp cho thế hệ sinh viên trẻ.
                        </p>
                        <p>
                            Dự án hệ thống đặt bàn cho nhà hàng Ratatouille là thành quả của những
                            kiến thức và kỹ năng mà chúng tôi đã tích lũy được trong quá trình học
                            tập tại Học viện. Dưới sự dìu dắt tận tình của các giảng viên khoa Công
                            nghệ Thông tin, chúng tôi đã kết hợp giữa chuyên môn công nghệ với niềm
                            đam mê ẩm thực để xây dựng một giải pháp thực tế cho hoạt động kinh doanh
                            nhà hàng, thể hiện tinh thần sáng tạo và khả năng ứng dụng công nghệ vào
                            cuộc sống của sinh viên PTIT.
                        </p>
                        <div className="school-stats">
                            {stats.map((stat, index) => (
                                <div key={index} className="stat-item">
                                    <div className="stat-number">{stat.number}</div>
                                    <div className="stat-label">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="school-image">
                        <img
                            src={ptitImage}
                            alt="Học viện Công nghệ Bưu chính Viễn thông cơ sở TP.HCM"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SchoolIntro;
