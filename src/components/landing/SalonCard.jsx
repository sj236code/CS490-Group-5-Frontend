import { Star, StarHalf, StarOff } from "lucide-react";

const StarRating = ({ rating }) => {
  const totalStars = 5;

  return (
    <div className="star-rating-display" style={{ display: "flex", gap: "2px" }}>
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

function SalonCard({ title, type, address, avgRating, totalReviews, onClick }) {

  const ratingValue = avgRating ?? 0;

  return (
    <div onClick={onClick} className="salon-card">
      <div className="salon-info">
        <h3 className="salon-title">{title}</h3>
        <p className="salon-type">{type}</p>
        <p className="salon-address">{address}</p>

        <div className="salon-rating">
          <div className="stars-and-rating">
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
    </div>
  );
}

export default SalonCard;
