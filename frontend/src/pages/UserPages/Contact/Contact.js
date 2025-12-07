import React from "react";
import ContactMap from "../../../components/Contact/ContactMap";
import ContactForm from "../../../components/Contact/ContactForm";
import TeamMember from "../../../components/Contact/TeamMember";
import SchoolIntro from "../../../components/SchoolIntro/SchoolIntro";
import SocialMedia from "../../../components/Contact/SocialMedia";
import "./Contact.css";

const Contact = () => {
  return (
    <div className="contact">
      <div className="contact-header">
        <div className="header-content">
          <h1>Liên Hệ Với Chúng Tôi</h1>
          <p>
            Chúng tôi luôn sẵn sàng lắng nghe ý kiến và phản hồi từ bạn. Hãy
            liên hệ với chúng tôi để chia sẻ những góp ý, câu hỏi hoặc yêu cầu
            của bạn.
          </p>
        </div>
      </div>

      <div className="contact-container">
        <div className="contact-grid">
          <div className="contact-form-section">
            <ContactForm />
          </div>
          <div className="social-media-section">
            <SocialMedia />
          </div>
        </div>
        <TeamMember />
        <SchoolIntro />
        <ContactMap />
      </div>
    </div>
  );
};

export default Contact;
