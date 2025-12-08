import { useState } from 'react';
import { X } from 'lucide-react';
import './PostReviewModal.css';

function PostReviewModal({ salon, customerId, onClose, onReviewPosted }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        // Limit to 2 images
        if (images.length + files.length > 2) {
            setError('You can only upload up to 2 images');
            return;
        }
        setImages([...images, ...files]);
        setError(null);
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
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
            // Append both images if they exist
            images.forEach((image, index) => {
                formData.append('picture', image);
            });

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
            setImages([]);

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
                        <label htmlFor="image">Add Photos (Optional, up to 2)</label>
                        <input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="file-input"
                            multiple
                            disabled={images.length >= 2}
                        />
                        {images.length > 0 && (
                            <div className="images-preview-container">
                                {images.map((img, index) => (
                                    <div key={index} className="image-preview">
                                        <img
                                            src={URL.createObjectURL(img)}
                                            alt={`Preview ${index + 1}`}
                                            style={{
                                                width: '100px',
                                                height: '100px',
                                                objectFit: 'cover',
                                                borderRadius: '4px',
                                                marginBottom: '8px'
                                            }}
                                        />
                                        <p style={{ fontSize: '12px', marginBottom: '4px' }}>
                                            {img.name}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="remove-image-btn"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {images.length >= 2 && (
                            <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                                Maximum of 2 images reached
                            </p>
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
