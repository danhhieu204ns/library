import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, X } from 'lucide-react';
import { reviewsAPI } from '../../services/api';

const RatingModal = ({ isOpen, onClose, book, user }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  const createReviewMutation = useMutation({
    mutationFn: (reviewData) => reviewsAPI.createReview(reviewData),
    onSuccess: () => {
      queryClient.invalidateQueries(['borrowings', user?.id]);
      onClose();
      setRating(5);
      setComment('');
      alert('Review submitted successfully!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to submit review');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user || !book) return;

    createReviewMutation.mutate({
      book_id: book._id,
      rating,
      comment: comment.trim()
    });
  };

  const renderStars = () => {
    return (
      <div className="flex items-center justify-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-8 w-8 cursor-pointer transition-colors ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300 hover:text-yellow-300'
            }`}
            onClick={() => setRating(star)}
          />
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Rate this Book</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-gray-900 text-center mb-2">
            {book?.title}
          </h4>
          <p className="text-sm text-gray-600 text-center mb-4">
            by {book?.author}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
              Your Rating
            </label>
            {renderStars()}
            <p className="text-xs text-gray-500 text-center mt-1">
              Click to rate
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Share your thoughts about this book..."
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/1000 characters
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={createReviewMutation.isLoading}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {createReviewMutation.isLoading ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
