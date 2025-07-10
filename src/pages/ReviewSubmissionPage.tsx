import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Star, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const reviewSchema = yup.object().shape({
  client_name: yup.string().required('Name is required'),
  client_initial: yup.string().required('Initial is required'),
  content: yup.string().required('Review content is required').min(10, 'Review must be at least 10 characters'),
  rating: yup.number().required('Rating is required').min(1).max(5),
  service_type: yup.string(),
});

type ReviewFormData = yup.InferType<typeof reviewSchema>;

const ReviewSubmissionPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ReviewFormData>({
    resolver: yupResolver(reviewSchema),
    defaultValues: {
      rating: 5
    }
  });

  const onSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('testimonials')
        .insert([{
          ...data,
          is_active: false // Reviews need admin approval
        }]);

      if (error) throw error;

      setIsSubmitted(true);
      reset();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('There was an error submitting your review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const serviceOptions = [
    'Chauffeur Service',
    'Airport Transfers',
    'Wedding Transport',
    'Corporate Transport',
    'Security Services',
    'Event Transport',
    'Other'
  ];

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
    setValue('rating', rating);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
            Thank You for Your Review!
          </h2>
          <p className="text-gray-600 mb-6">
            Your review has been submitted and is pending approval. We appreciate your feedback and will review it shortly.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="bg-yellow-400 text-black px-6 py-3 rounded-md font-medium hover:bg-yellow-500 transition-colors duration-200"
          >
            Submit Another Review
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
            Share Your Experience
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We value your feedback. Please share your experience with our transport and security services.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="client_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  {...register('client_name')}
                  type="text"
                  id="client_name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-yellow-400 focus:border-yellow-400 transition-colors duration-200"
                  placeholder="Your full name"
                />
                {errors.client_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.client_name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="client_initial" className="block text-sm font-medium text-gray-700 mb-2">
                  Display Initial *
                </label>
                <input
                  {...register('client_initial')}
                  type="text"
                  id="client_initial"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-yellow-400 focus:border-yellow-400 transition-colors duration-200"
                  placeholder="e.g., J.M."
                  maxLength={10}
                />
                {errors.client_initial && (
                  <p className="mt-1 text-sm text-red-600">{errors.client_initial.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  This will be displayed publicly with your review
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="service_type" className="block text-sm font-medium text-gray-700 mb-2">
                Service Used
              </label>
              <select
                {...register('service_type')}
                id="service_type"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-yellow-400 focus:border-yellow-400 transition-colors duration-200"
              >
                <option value="">Select a service</option>
                {serviceOptions.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating *
              </label>
              <div className="flex items-center space-x-1 mb-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleRatingClick(rating)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors duration-200 ${
                        rating <= selectedRating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300 hover:text-yellow-400'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <input
                {...register('rating')}
                type="hidden"
                value={selectedRating}
              />
              {errors.rating && (
                <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Your Review *
              </label>
              <textarea
                {...register('content')}
                id="content"
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-yellow-400 focus:border-yellow-400 transition-colors duration-200"
                placeholder="Please share your experience with our service..."
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Your review will be reviewed by our team before being published on our website. 
                We appreciate your honest feedback and will only publish reviews that meet our quality standards.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-yellow-400 text-black px-6 py-3 rounded-md font-medium hover:bg-yellow-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting Review...' : 'Submit Review'}
            </button>
          </form>
        </motion.div>

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
            Why Your Review Matters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-black" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Help Others Choose</h3>
              <p className="text-gray-600 text-sm">
                Your honest feedback helps other clients make informed decisions about our services.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-black" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Improve Our Service</h3>
              <p className="text-gray-600 text-sm">
                We use your feedback to continuously improve our transport and security services.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  ⭐
                </motion.div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Build Trust</h3>
              <p className="text-gray-600 text-sm">
                Authentic reviews build trust and credibility in our professional services.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReviewSubmissionPage;