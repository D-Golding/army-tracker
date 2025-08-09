// components/SummaryCards.jsx
import React from 'react';

const SummaryCards = ({ summary, onFilterClick }) => {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <button
        onClick={() => onFilterClick('collection')}
        className="summary-card-emerald transition-all hover:shadow-lg active:scale-95 text-left"
      >
        <div className="summary-value-emerald">{summary.collection}</div>
        <div className="summary-label">My Collection</div>
      </button>

      <button
        onClick={() => onFilterClick('wishlist')}
        className="summary-card-purple transition-all hover:shadow-lg active:scale-95 text-left"
      >
        <div className="summary-value-purple">{summary.wishlist}</div>
        <div className="summary-label">Wishlist</div>
      </button>

      <button
        onClick={() => onFilterClick('almostempty')}
        className="summary-card-amber transition-all hover:shadow-lg active:scale-95 text-left"
      >
        <div className="summary-value-amber">{summary.lowStock || 0}</div>
        <div className="summary-label">Almost Empty</div>
      </button>
    </div>
  );
};

export default SummaryCards;