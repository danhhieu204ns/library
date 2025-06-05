import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, MessageSquare, ThumbsUp, Edit, Trash2, Plus } from 'lucide-react';
import { reviewsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const BookReviews = ({ bookId }) => {
  const { user } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    review_text: ''
  });
  const queryClient = useQueryClient();

  // Fetch reviews for this book
  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', bookId],
    queryFn: () => reviewsAPI.getReviews({ book_id: bookId }),
    enabled: !!bookId
  });

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: (reviewData) => reviewsAPI.createReview(reviewData),
    onSuccess: () => {
      queryClient.invalidateQueries(['reviews', bookId]);
      setShowReviewForm(false);
      setReviewForm({ rating: 5, review_text: '' });
      alert('Review submitted successfully!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to submit review');
    }
  });

  // Update review mutation
  const updateReviewMutation = useMutation({
    mutationFn: ({ id, ...reviewData }) => reviewsAPI.updateReview(id, reviewData),
    onSuccess: () => {
      queryClient.invalidateQueries(['reviews', bookId]);
      setEditingReview(null);
      setReviewForm({ rating: 5, review_text: '' });
      alert('Review updated successfully!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to update review');
    }
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId) => reviewsAPI.deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries(['reviews', bookId]);
      alert('Review deleted successfully!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to delete review');
    }
  });

  const reviews = reviewsData?.data || [];
  const userReview = reviews.find(review => review.user?._id === user?.id);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to submit a review');
      return;
    }

    const reviewData = {
      book: bookId,
      rating: reviewForm.rating,
      review_text: reviewForm.review_text
    };

    if (editingReview) {
      updateReviewMutation.mutate({ id: editingReview._id, ...reviewData });
    } else {
      createReviewMutation.mutate(reviewData);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setReviewForm({
      rating: review.rating,
      review_text: review.review_text
    });
    setShowReviewForm(true);
  };

  const handleDeleteReview = (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      deleteReviewMutation.mutate(reviewId);
    }
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Reviews</h3>
          {reviews.length > 0 && (
            <div className="flex items-center mt-2">
              {renderStars(Math.round(averageRating))}
              <span className="ml-2 text-sm text-gray-600">
                {averageRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
        </div>
        
        {user && !userReview && !showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Write Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            {editingReview ? 'Edit Your Review' : 'Write a Review'}
          </h4>
          <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              {renderStars(
                reviewForm.rating, 
                true, 
                (rating) => setReviewForm(prev => ({ ...prev, rating }))
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review
              </label>
              <textarea
                value={reviewForm.review_text}
                onChange={(e) => setReviewForm(prev => ({ ...prev, review_text: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Share your thoughts about this book..."
                required
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={createReviewMutation.isLoading || updateReviewMutation.isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {createReviewMutation.isLoading || updateReviewMutation.isLoading ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(false);
                  setEditingReview(null);
                  setReviewForm({ rating: 5, review_text: '' });
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {reviewsLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg border p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-gray-200 h-10 w-10 rounded-full"></div>
                <div className="flex-1">
                  <div className="bg-gray-200 h-4 w-24 rounded mb-1"></div>
                  <div className="bg-gray-200 h-3 w-32 rounded"></div>
                </div>
              </div>
              <div className="bg-gray-200 h-4 w-full rounded mb-2"></div>
              <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Be the first to share your thoughts about this book
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {(review.user?.full_name || review.user?.username || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {review.user?.full_name || review.user?.username || 'Anonymous'}
                    </p>
                    <div className="flex items-center space-x-2">
                      {renderStars(review.rating)}
                      <span className="text-xs text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {user && review.user?._id === user.id && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditReview(review)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              
              <p className="text-gray-700 text-sm leading-relaxed">
                {review.review_text}
              </p>
              
              {review.helpful_count > 0 && (
                <div className="mt-3 flex items-center text-sm text-gray-500">
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  {review.helpful_count} people found this helpful
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookReviews;
