import { Star, StarHalf, StarOff } from "lucide-react";
import React, { useState } from "react";

const StarRating = ({ rating }) => {
  const totalStars = 5;

  return (
    <div className="star-rating-display">
      {[...Array(totalStars)].map((_, i) => {
        const starIndex = i + 1;

        if (rating >= starIndex) {
          return <Star key={i} size={16} fill="#4B5945" color="#4B5945" />;
        }

        if (rating >= starIndex - 0.5) {
          return <StarHalf key={i} size={16} fill="#4B5945" color="#4B5945" />;
        }

        return <StarOff key={i} size={16} fill="#E0E0E0" color="#E0E0E0" />;
      })}
    </div>
  );
};

function SalonCard({
  title,
  type,
  address,
  avgRating,
  totalReviews,
  imageUrl,
  onClick,
}) {
  const [imageError, setImageError] = useState(false);
  const ratingValue = avgRating ?? 0;
  const initial = title?.charAt(0).toUpperCase() ?? "?";
  const displayType = Array.isArray(type) ? type.join(", ") : type;

  return (
    <div className="salon-card" onClick={onClick}>
      {/* TOP IMAGE AREA – SAME PATTERN AS TYPE CARD */}
      <div className="salon-card-image">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={title}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="salon-card-placeholder">
            {initial}
          </div>
        )}
      </div>

      {/* BOTTOM CONTENT AREA */}
      <div className="salon-card-content">
        <h3 className="salon-card-name">{title}</h3>
        {displayType && <p className="salon-card-type">{displayType}</p>}
        <p className="salon-card-address">{address}</p>

        <div className="salon-card-rating-row">
          <span className="rating-number">
            {ratingValue ? ratingValue.toFixed(1) : "N/A"}
          </span>
          <StarRating rating={ratingValue || 0} />
          <span className="review-text">
            ({totalReviews ?? 0} Reviews)
          </span>
        </div>
      </div>
    </div>
  );
}

export default SalonCard;
