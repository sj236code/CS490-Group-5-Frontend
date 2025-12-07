import { useState, useEffect } from 'react';
import { Star, Plus } from 'lucide-react';
import PostReviewModal from './PostReviewModal';
import './ReviewsTab.css'; 


const StarRating = ({ rating }) => {
    const totalStars = 5;
    return (
        <div className="star-rating">
            {[...Array(totalStars)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <Star
                        key={index}
                        size={16}
                        fill={starValue <= rating ? '#FFD700' : '#E0E0E0'}
                        color={starValue <= rating ? '#FFD700' : '#E0E0E0'}
                    />
                );
            })}
        </div>
    );
};

function ReviewsTab({ salon }) {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPostModal, setShowPostModal] = useState(false);
    const [customerId, setCustomerId] = useState(null);

    useEffect(() => {
        const storedUserId = localStorage.getItem('user_id');
        if (storedUserId) {
            // Get customer ID
            fetch(`${import.meta.env.VITE_API_URL}/api/auth/user-type/${storedUserId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.profile_id) {
                        setCustomerId(data.profile_id);
                    }
                })
                .catch(err => console.error('Failed to fetch customer profile:', err));
        }
    }, []);

    useEffect(() => {
        if (!salon?.id) {
            setError("No salon ID provided.");
            setIsLoading(false);
            return;
        }

        const fetchReviews = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/salons/details/${salon.id}/reviews`);
                if (!response.ok) {
                    throw new Error("Failed to fetch reviews");
                }
                const data = await response.json();
                setReviews(data.reviews || []);
            } catch (err) {
                console.error(err);
                setError("Failed to load reviews. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchReviews();
    }, [salon.id]);

    if (isLoading) {
        return <div>Loading reviews...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>{error}</div>;
    }

    if (reviews.length === 0) {
        return (
            <div className="reviews-container">
                <div className="reviews-empty">
                    <p>No reviews have been posted yet.</p>
                    {customerId ? (
                        <button
                            className="btn-post-review"
                            onClick={() => setShowPostModal(true)}
                        >
                            <Plus size={18} />
                            Be the first to review
                        </button>
                    ) : (
                        <p className="login-prompt">Sign in to post a review</p>
                    )}
                </div>
                {showPostModal && customerId && (
                    <PostReviewModal
                        salon={salon}
                        customerId={customerId}
                        onClose={() => setShowPostModal(false)}
                        onReviewPosted={() => {
                            // Refresh reviews after posting
                            window.location.reload();
                        }}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="reviews-container">
            <div className="reviews-header">
                <h2>Reviews</h2>
                {customerId ? (
                    <button
                        className="btn-post-review"
                        onClick={() => setShowPostModal(true)}
                    >
                        <Plus size={18} />
                        Post a Review
                    </button>
                ) : (
                    <p className="login-prompt">Sign in to post a review</p>
                )}
            </div>
            <div className="reviews-list">
                {reviews.map((review) => (
                <div key={review.id} className="review-item">
                    <div className="review-header">
                        <span className="review-customer-name">{review.customer_name}</span>
                        <span className="review-date">
                            {new Date(review.created_at).toLocaleDateString()}
                        </span>
                    </div>
                    <StarRating rating={review.rating} />
                    <p className="review-comment">{review.comment}</p>
                    
                    {/* Display review images if they exist */}
                    {review.images && review.images.length > 0 && (
                        <div className="review-images-grid">
                            {review.images.map((imgUrl, index) => (
                                <img
                                    key={index}
                                    src={imgUrl}
                                    alt={`Review image ${index + 1}`}
                                    className="review-image-item"
                                />
                            ))}
                        </div>
                    )}
                </div>
            ))}
            </div>

            {showPostModal && customerId && (
                <PostReviewModal
                    salon={salon}
                    customerId={customerId}
                    onClose={() => setShowPostModal(false)}
                    onReviewPosted={() => {
                        // Refresh reviews after posting
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
}

export default ReviewsTab;