'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Star } from 'lucide-react';
import servexApi from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function RatePage() {
  const router = useRouter();
  const params = useParams();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [appText, setAppText] = useState<any>({});

  useEffect(() => {
    // Check authentication
    const userId = localStorage.getItem('user_id');
    if (!userId || userId === 'null' || userId === 'undefined') {
      toast.error('Please login first');
      router.push('/login');
      return;
    }

    // Load app text
    const text = localStorage.getItem('app_text');
    if (text) setAppText(JSON.parse(text));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      setLoading(true);
      const userId = localStorage.getItem('user_id');
      
      const ratingData = {
        comment: comment,
        user_id: userId,
        star: rating,
        oid: params.id
      };

      await servexApi.rating(ratingData);
      
      toast.success('Thank You! Rating Submitted Successfully.');
      router.push('/orders');
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">{appText.rating_title || 'Rate Order'}</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating Description */}
            <div>
              <p className="text-sm text-gray-600 mb-6">
                {appText.rating_des || 'How was your experience? Please rate your order'}
              </p>
            </div>

            {/* Star Rating */}
            <div className="flex flex-col items-center space-y-4">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`w-12 h-12 ${
                        star <= (hoveredRating || rating)
                          ? 'fill-orange-500 text-orange-500'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              
              {rating > 0 && (
                <p className="text-lg font-semibold text-gray-700">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Write your review (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Share your experience with this order..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Submitting...' : appText.submit_btn || 'Submit Rating'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
