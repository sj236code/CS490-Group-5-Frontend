import { useState } from 'react';
import { X } from 'lucide-react';
import './PostReviewModal.css'; // Reuse the same styles

function PostReplyModal({ review, replierId, onClose, onReplyPosted }) {
    const [textBody, setTextBody] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!textBody.trim()) {
            setError('Reply text cannot be empty');
            return;
        }

        if (!replierId || !review?.id) {
            setError('Missing required information');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/reviews/${review.id}/reply`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        replier_id: replierId,
                        text_body: textBody.trim()
                    })
                }
            );

            if (!response.ok) {
                let errorMessage = 'Failed to post reply';
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
            setTextBody('');

            if (onReplyPosted) {
                onReplyPosted();
            }

            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            console.error('Error posting reply:', err);
            setError(err.message || 'Failed to post reply. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="post-review-modal-overlay">
            <div className="post-review-modal">
                <div className="post-review-modal-header">
                    <h2>Reply to Review</h2>
                    <button
                        className="post-review-close-btn"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="review-context" style={{
                    padding: '12px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                    marginBottom: '16px'
                }}>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                        <strong>Replying to review by {review.customer_name}</strong>
                    </p>
                    <p style={{ fontSize: '14px', color: '#333' }}>
                        "{review.comment}"
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="post-review-form">
                    {error && <div className="post-review-error">{error}</div>}
                    {success && (
                        <div className="post-review-success">
                            Reply posted successfully!
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="reply-text">Your Reply</label>
                        <textarea
                            id="reply-text"
                            value={textBody}
                            onChange={(e) => setTextBody(e.target.value)}
                            placeholder="Thank your customer or address their feedback..."
                            maxLength={500}
                            rows={5}
                            required
                        />
                        <span className="char-count">
                            {textBody.length}/500
                        </span>
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
                            {isSubmitting ? 'Posting...' : 'Post Reply'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PostReplyModal;
