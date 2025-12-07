import React from "react";
import "./BigCollectionCard.css";
import { Link } from "react-router-dom";

function BigCollectionCard({ image, title, subtitle, description, link }) {
  return (
    <div className="big-collection-card-wrapper">
      <Link className="card-link" to={link}>
        <div class="card mb-3 big-collection-card">
          <div class="row g-0">
            <div class="col-md-8">
              <img
                src={image}
                class="img-fluid rounded-start"
                alt="Food image"
              />
            </div>
            <div class="col-md-4">
              <div class="card-body">
                <p class="card-subtitle">{subtitle}</p>
                <h3 class="card-title">{title}</h3>
                <p class="card-description">{description}</p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default BigCollectionCard;
