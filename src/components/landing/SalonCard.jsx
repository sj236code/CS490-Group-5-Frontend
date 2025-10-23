function SalonCard({ title, type, avgRating, totalReviews, onClick }) {
  return (
    <div onClick={onClick} className="salon-card">
        <div className="salon-info">
            <h3 className='salon-title'>{title}</h3>
            <p className="salon-details">{type}</p>
            <p>Rating: {avgRating ?? "N/A"} ({totalReviews}) </p>
        </div>
    </div>
  );
}

export default SalonCard;
