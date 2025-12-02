import { useState } from 'react';
import { X } from 'lucide-react';
import './PostReviewModal.css';

function PostReviewModal({ salon, customerId, onClose, onReviewPosted }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [image, setImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!rating || !customerId || !salon?.id) {
            setError('Missing required information');
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('customer_id', customerId);
            formData.append('salon_id', salon.id);
            formData.append('rating', rating);
            formData.append('comment', comment || '');
            if (image) {
                formData.append('picture', image);
            }

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/reviews/postreview`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            if (!response.ok) {
                let errorMessage = 'Failed to post review';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch (e) {
                    errorMessage = `Server error (${response.status}): ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            await response.json();
            setSuccess(true);
            setRating(5);
            setComment('');
            setImage(null);

            if (onReviewPosted) {
                onReviewPosted();
            }

            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            console.error('Error posting review:', err);
            setError(err.message || 'Failed to post review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="post-review-modal-overlay">
            <div className="post-review-modal">
                <div className="post-review-modal-header">
                    <h2>Post a Review</h2>
                    <button
                        className="post-review-close-btn"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="post-review-form">
                    {error && <div className="post-review-error">{error}</div>}
                    {success && (
                        <div className="post-review-success">
                            Review posted successfully!
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="rating">Rating</label>
                        <div className="rating-selector">
                            {[1, 2, 3, 4, 5].map((value) => (
                                <button
                                    key={value}
                                    type="button"
                                    className={`rating-btn ${rating >= value ? 'active' : ''}`}
                                    onClick={() => setRating(value)}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                        <span className="rating-value">{rating} out of 5</span>
                    </div>

                    <div className="form-group">
                        <label htmlFor="comment">Your Review (Optional)</label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience at this salon..."
                            maxLength={500}
                            rows={5}
                        />
                        <span className="char-count">
                            {comment.length}/500
                        </span>
                    </div>

                    <div className="form-group">
                        <label htmlFor="image">Add Photo (Optional)</label>
                        <input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="file-input"
                        />
                        {image && (
                            <div className="image-preview">
                                <p>Selected: {image.name}</p>
                                <button
                                    type="button"
                                    onClick={() => setImage(null)}
                                    className="remove-image-btn"
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-cancel"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Posting...' : 'Post Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PostReviewModal;
