// components/paints/PaintList/components/BackToTopButton.jsx
import React from 'react';
import { ChevronUp } from 'lucide-react';

const BackToTopButton = ({ onClick, show }) => {
  if (!show) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-6 z-50 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 ease-out transform hover:scale-105"
      title="Back to top"
    >
      <ChevronUp size={24} />
    </button>
  );
};

export default BackToTopButton;