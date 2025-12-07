import React from "react";
import "./SmallCollectionCard.css";
import { Link } from "react-router-dom";

function SmallCollectionCard({ image, title, link }) {
    return (
        <div className="small-collection-card">
            <div className="col">
                <Link className="card-link" to={link}>
                    <div className="card">
                        <img src={image} className="card-img" alt="Food" />
                        <div className="card-img-overlay">
                            <p className="card-subtitle">Bộ sưu tập</p>
                            <h3 className="card-title">{title}</h3>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}

export default SmallCollectionCard;
