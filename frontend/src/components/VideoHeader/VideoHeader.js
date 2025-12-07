import React from "react";
import videoBlog from "../../assets/imgBlog/video2.mp4";
import "./VideoHeader.css";

const VideoHeader = () => {
    return (
        <div className="video-blog-background">
            <div className="overlay"></div>
            <div>
                <video
                    src={videoBlog}
                    disablePictureInPicture
                    autoPlay
                    loop
                    muted
                    width="100%"
                    style={{ display: "block" }}
                    aria-label="Background video of Ratatouille"
                />
            </div>
            <div className="content">
                <p>Ratatouille</p>
                <h3>Welcome</h3>
            </div>
        </div>
    );
};

export default VideoHeader;
