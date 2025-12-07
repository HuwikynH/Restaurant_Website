import React from "react";
import "./FeatureCollection.css";
import "../BigCollectionCard/BigCollectionCard";
import BigCollectionCard from "../BigCollectionCard/BigCollectionCard";

import FeatureCollectionRecipeImage from "../../assets/img/romatic-dinner.webp";

function FeatureCollection() {
    const featureCollectionRecipe = {
        image: FeatureCollectionRecipeImage,
        title: "Bữa Tối Lý Tưởng Cho Ngày Hẹn Hò",
        subtitle: "Bộ sưu tập",
        description:
            "Tận hưởng bữa tối lãng mạn tại nhà – ngon hơn, tiết kiệm hơn, ý nghĩa hơn!",
        link: "#",
    };
    return (
        <div
            className="feature-collection-wrapper"
            id="feature-collection"
        >
            <BigCollectionCard
                image={featureCollectionRecipe.image}
                title={featureCollectionRecipe.title}
                subtitle={featureCollectionRecipe.subtitle}
                description={featureCollectionRecipe.description}
                link={featureCollectionRecipe.link}
            />
        </div>
    );
}

export default FeatureCollection;
