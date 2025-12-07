import React from "react";
import "./SmallCollectionGrid.css";
import SmallCollectionCard from "../SmallCollectionCard/SmallCollectionCard";

function SmallCollectionGrid({ collectionList }) {
    return (
        <div className="small-collection-grid-wrapper">
            <div className="card-container">
                <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
                    {collectionList.map((collection, index) => (
                        <SmallCollectionCard
                            key={index}
                            image={collection.image}
                            title={collection.title}
                            link={collection.link}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SmallCollectionGrid;
