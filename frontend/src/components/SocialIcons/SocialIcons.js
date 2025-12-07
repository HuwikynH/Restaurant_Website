import React from "react";
import "./SocialIcons.css";
const SocialIcons = () => {
  const socialLinks = [
    {
      icon: "bxl-facebook-circle",
      url: "https://web.facebook.com/people/Ratatouille-Page/61574059620067/",
      label: "Visit our Facebook page",
    },
    {
      icon: "bxl-tiktok",
      url: "https://www.tiktok.com/@thecookingfoodie",
      label: "Visit our TikTok page",
    },
    {
      icon: "bxl-youtube",
      url: "https://www.youtube.com/@TheCookingFoodie/videos",
      label: "Visit our YouTube channel",
    },
  ];

  return (
    <div className="blog-social-icons">
      {socialLinks.map((social, index) => (
        <a
          key={index}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.label}
        >
          <i className={`bx ${social.icon}`}></i>
        </a>
      ))}
    </div>
  );
};

export default SocialIcons;
