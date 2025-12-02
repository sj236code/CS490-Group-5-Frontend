import { Star } from 'lucide-react';

const StarRating = ({ rating }) => {
  const totalStars = 5;
  return (
    <div className="star-rating-display">
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <Star
            key={index}
            size={16}
            fill={starValue <= rating ? '#4B5945' : '#E0E0E0'}
            color={starValue <= rating ? '#4B5945' : '#E0E0E0'}
          />
        );
      })}
    </div>
  );
};

function SalonCard({ title, type, address, avgRating, totalReviews, onClick }) {
  const rating = avgRating ? Math.round(avgRating) : 0;

  return (
    <div onClick={onClick} className="salon-card">
      <div className="salon-info">
        <h3 className='salon-title'>{title}</h3>
        <p className="salon-type">{type}</p>
        <p className="salon-address">{address}</p>
        <div className="salon-rating">
          <div className="stars-and-rating">
            <span className="rating-text">{avgRating ? avgRating.toFixed(1) : "N/A"}</span>
            <StarRating rating={rating} />
          </div>
          <span className="review-count">({totalReviews} reviews)</span>
        </div>
      </div>
    </div>
  );
}

export default SalonCard;