import React from "react";
import videoBlog2 from "../../assets/imgBlog/Creamy Garlic Chicken.mp4";
import ratLogo from "../../assets/imgBlog/rat_logo.png";
import "./TikTokVideo.css";

const TikTokVideo = () => {
    return (
        <div className="video-tiktok-container" style={{ position: "relative" }}>
            {/* Logo TikTok góc phải trên */}
            <div
                className="tiktok-logo"
                style={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}
            >
                <i
                    className="bx bxl-tiktok"
                    aria-hidden="true"
                    style={{ fontSize: 48, color: "#fff", textShadow: "0 0 6px #000" }}
                ></i>
            </div>
            {/* Video */}
            <a
                href="https://www.tiktok.com/@thecookingfoodie"
                target="_blank"
                rel="noopener noreferrer"
                className="video-tiktok-link"
                style={{ textDecoration: "none", color: "inherit", display: "block" }}
                aria-label="Xem trên TikTok"
            >
                <video
                    src={videoBlog2}
                    disablePictureInPicture
                    autoPlay
                    loop
                    muted
                    width="100%"
                    style={{ display: "block", borderRadius: 12 }}
                    aria-label="Creamy Garlic Chicken recipe video"
                    loading="lazy"
                />
            </a>
            {/* Icon dọc bên phải */}
            <div
                className="tiktok-icons"
                style={{
                    position: "absolute",
                    right: 16,
                    top: 80,
                    zIndex: 10,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 18,
                }}
            >
                <img
                    src={ratLogo}
                    alt="rat chef avatar"
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginBottom: 6,
                    }}
                />
                <div style={{ textAlign: "center", color: "#fff" }}>
                    <i
                        className="bx bxs-heart"
                        style={{ fontSize: 32, color: "#fff", textShadow: "0 0 4px #000" }}
                    ></i>
                    <div style={{ fontSize: 14 }}>1.2K</div>
                </div>
                <div style={{ textAlign: "center", color: "#fff" }}>
                    <i
                        className="bx bx-message-rounded"
                        style={{ fontSize: 32, color: "#fff", textShadow: "0 0 4px #000" }}
                    ></i>
                    <div style={{ fontSize: 14 }}>24</div>
                </div>
                <div style={{ textAlign: "center", color: "#fff" }}>
                    <i
                        className="bx bx-share-alt"
                        style={{ fontSize: 32, color: "#fff", textShadow: "0 0 4px #000" }}
                    ></i>
                    <div style={{ fontSize: 14 }}>381</div>
                </div>
            </div>
            {/* Thông tin tài khoản và nhạc */}
            <div
                className="tiktok-info"
                style={{
                    position: "absolute",
                    left: 16,
                    bottom: 16,
                    color: "#fff",
                    zIndex: 10,
                    textShadow: "0 0 6px #000",
                }}
            >
                <div style={{ fontWeight: "bold", fontSize: 16 }}>@thecookingfoodie</div>
                <div style={{ fontSize: 14, marginTop: 4 }}>
                    <i className="bx bx-music" style={{ marginRight: 4 }}></i>
                    Lo-fi Hip Hop
                </div>
            </div>
        </div>
    );
};

export default TikTokVideo;
