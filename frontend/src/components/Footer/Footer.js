import React, { useContext } from "react";
import "./Footer.css";
import { Link, NavLink } from "react-router-dom";
import Logo from "../../assets/img/ratatouille-original.png";

function Footer() {
    return (
        <footer className="footer" id="footer">
            <div className="container">
                <div className="row">
                    <div className="footer-col">
                        <h4>Ratatouille</h4>
                        <ul>
                            <li>
                                <NavLink className="footer-nav-link" to="/blog">
                                    Blog
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className="footer-nav-link" to="/recipes">
                                    Mục lục công thức
                                </NavLink>
                            </li>
                            
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>Món ăn & Công thức</h4>
                        <ul>
                            <li>
                                <NavLink className="footer-nav-link" to="#">
                                    Nhanh & Dễ dàng
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className="footer-nav-link" to="#">
                                    Thuần chay
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className="footer-nav-link" to="#">
                                    Nấu súp
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className="footer-nav-link" to="#">
                                    Đồ uống
                                </NavLink>
                            </li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>Theo dõi chúng tôi</h4>

                        <div className="social-icon">
                            <a
                                href="https://www.facebook.com/profile.php?id=61574059620067"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <i className="bx bxl-facebook-circle"></i>
                            </a>
                            <a href="#" rel="noopener noreferrer">
                                <i className="bx bxl-tiktok"></i>
                            </a>
                            <a href="#" rel="noopener noreferrer">
                                <i className="bx bxl-youtube"></i>
                            </a>
                        </div>
                        <NavLink to="/">
                            <img src={Logo} alt="Logo" />
                        </NavLink>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>
                    Copyright &copy;2025; Designed by <span className="designer">Remy</span>
                </p>
            </div>
        </footer>
    );
}

export default Footer;
