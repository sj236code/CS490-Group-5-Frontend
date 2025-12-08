import { useState, useEffect } from 'react';
import { Star, Plus, MessageSquare } from 'lucide-react';
import PostReviewModal from './PostReviewModal';
import PostReplyModal from './PostReplyModal';
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

function ReviewsTab({ salon, user }) {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPostModal, setShowPostModal] = useState(false);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [customerId, setCustomerId] = useState(null);
    const [isSalonOwner, setIsSalonOwner] = useState(false);
    const [salonOwnerId, setSalonOwnerId] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const storedUserId = localStorage.getItem('user_id');
        if (storedUserId) {
            setIsLoggedIn(true);
            // Get customer ID or salon owner ID based on role
            fetch(`${import.meta.env.VITE_API_URL}/api/auth/user-type/${storedUserId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.role === 'OWNER' && data.profile_id) {
                        // Check if this owner owns the current salon
                        fetch(`${import.meta.env.VITE_API_URL}/api/salons/get_salon/${data.profile_id}`)
                            .then(res => res.json())
                            .then(salonData => {
                                if (salonData.salon_ids && salonData.salon_ids.includes(salon?.id)) {
                                    setIsSalonOwner(true);
                                    setSalonOwnerId(storedUserId); // Use user_id for replier_id
                                }
                            })
                            .catch(err => console.error('Failed to fetch salon ownership:', err));
                    } else if (data.role === 'CUSTOMER' && data.profile_id) {
                        setCustomerId(data.profile_id);
                    }
                })
                .catch(err => console.error('Failed to fetch user profile:', err));
        } else {
            setIsLoggedIn(false);
        }
    }, [salon?.id]);

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
                    {customerId && (
                        <button
                            className="btn-post-review"
                            onClick={() => setShowPostModal(true)}
                        >
                            <Plus size={18} />
                            Be the first to review
                        </button>
                    )}
                    {!isLoggedIn && (
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
                {customerId && (
                    <button
                        className="btn-post-review"
                        onClick={() => setShowPostModal(true)}
                    >
                        <Plus size={18} />
                        Post a Review
                    </button>
                )}
                {!isLoggedIn && (
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

                    {/* Display review replies if they exist */}
                    {review.replies && review.replies.length > 0 && (
                        <div className="review-replies">
                            {review.replies.map((reply) => (
                                <div key={reply.id} className="review-reply-item">
                                    <div className="reply-header">
                                        <span className="reply-author">{salon.name || salon.title}</span>
                                        <span className="reply-date">
                                            {new Date(reply.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="reply-text">{reply.text_body}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Reply button for salon owners (only if no reply exists) */}
                    {isSalonOwner && (!review.replies || review.replies.length === 0) && (
                        <div style={{ display: 'flex' }}>
                            <button
                                className="btn-reply"
                                onClick={() => {
                                    setSelectedReview(review);
                                    setShowReplyModal(true);
                                }}
                            >
                                <MessageSquare size={16} />
                                Reply
                            </button>
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

            {showReplyModal && selectedReview && salonOwnerId && (
                <PostReplyModal
                    review={selectedReview}
                    replierId={salonOwnerId}
                    onClose={() => {
                        setShowReplyModal(false);
                        setSelectedReview(null);
                    }}
                    onReplyPosted={() => {
                        // Refresh reviews after posting reply
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
}

export default ReviewsTab;