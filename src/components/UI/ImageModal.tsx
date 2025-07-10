import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { GalleryImage } from '../../lib/supabase';

interface ImageModalProps {
  image: GalleryImage;
  isOpen: boolean;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ image, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="relative max-w-6xl max-h-[90vh] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-colors duration-200"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Image Container */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <img
            src={image.image_url}
            alt={image.title}
            className="w-full h-auto max-h-[70vh] object-contain"
          />
          
          {/* Scrolling Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent text-white p-6 max-h-[40vh] overflow-y-auto">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h2 className="text-2xl md:text-3xl font-serif font-bold">
                {image.title}
              </h2>
              
              {image.description && (
                <p className="text-gray-200 text-lg leading-relaxed">
                  {image.description}
                </p>
              )}
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="inline-block bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-medium">
                  {image.category}
                </span>
                
                {image.caption && (
                  <p className="text-gray-300 text-sm italic">
                    {image.caption}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ImageModal;