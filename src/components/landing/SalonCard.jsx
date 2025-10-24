import { Star } from 'lucide-react';

function SalonCard({ title, type, address, avgRating, totalReviews, onClick }) {
  return (
    <div onClick={onClick} className="salon-card">
        <div className="salon-info">
            <h3 className='salon-title'>{title}</h3>
            <p className="salon-type">{type}</p>
            <p className="salon-address">{address}</p>
            <div className="salon-rating">
              <span className="rating-value">
                <Star size={16} fill="#4B5945"/>
                {avgRating ?? "N/A"}
              </span>
              <span className="review-count">({totalReviews} reviews)</span>
            </div>
        </div>
    </div>
  );
}

export default SalonCard;