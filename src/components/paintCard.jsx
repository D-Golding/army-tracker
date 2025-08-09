// components/PaintCard.jsx
import React, { useState } from 'react';
import { Droplet, Brush, Trash2, Minus, Heart, Check, Plus, MoreVertical } from 'lucide-react';

const PaintCard = ({
  paint,
  onRefill,
  onReducePaint,
  onMoveToCollection,
  onMoveToWishlist,
  onMoveToListed,
  onDelete
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const getLevelColor = (level) => {
    if (level > 50) return 'bg-gradient-to-r from-emerald-500 to-emerald-400';
    if (level > 25) return 'bg-gradient-to-r from-amber-500 to-amber-400';
    return 'bg-gradient-to-r from-red-500 to-red-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Paint Header */}
      <div className="p-5 pb-0">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{paint.name}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{paint.brand} • {paint.type}</p>
          </div>
          <div className="flex flex-col gap-1 items-end">
            {paint.airbrush && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-lg font-medium">
                <Brush className="inline-block mr-1" size={10} />
                Airbrush
              </span>
            )}
            {paint.sprayPaint && (
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs rounded-lg font-medium">
                Spray
              </span>
            )}

            {/* Status Badges */}
            <div className="flex gap-1">
              <button
                onClick={() => onMoveToCollection(paint.name)}
                className={`px-2 py-1 text-xs rounded-lg font-medium cursor-pointer transition-all hover:shadow-md flex items-center gap-1 ${
                  paint.status === 'collection'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-300' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                }`}
                title="Add to Collection"
              >
                <Check size={10} />
              </button>

              <button
                onClick={() => onMoveToWishlist(paint.name)}
                className={`px-2 py-1 text-xs rounded-lg font-medium cursor-pointer transition-all hover:shadow-md flex items-center gap-1 ${
                  paint.status === 'wishlist'
                    ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300 ring-2 ring-pink-300' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-pink-50 dark:hover:bg-pink-900/20'
                }`}
                title="Add to Wishlist"
              >
                <Heart size={10} />
              </button>
            </div>
          </div>
        </div>

        {/* Level Progress with Controls - Only show for collection paints */}
        {paint.status === 'collection' && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Level</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{paint.level}%</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onReducePaint(paint.name)}
                className="px-2 py-1 bg-gradient-to-r from-orange-600 to-orange-500 text-white text-xs font-semibold rounded-lg active:scale-95 transition-transform"
                title="Use Paint (-10%)"
              >
                <Minus size={12} />
              </button>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getLevelColor(paint.level)}`}
                  style={{ width: `${paint.level}%` }}
                ></div>
              </div>
              <button
                onClick={() => onRefill(paint.name)}
                className="px-2 py-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs font-semibold rounded-lg active:scale-95 transition-transform"
                title="Refill to 100%"
              >
                <Droplet size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Wishlist message and actions */}
        {paint.status === 'wishlist' && (
          <div className="mb-4 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
            <div className="flex justify-between items-center">
              <p className="text-sm text-pink-700 dark:text-pink-300 italic">
                On your wishlist
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => onMoveToCollection(paint.name)}
                  className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs font-semibold rounded-lg active:scale-95 transition-transform flex items-center gap-1"
                  title="Add to Collection"
                >
                  <Plus size={12} />
                  Add to Collection
                </button>
                <button
                  onClick={() => onMoveToListed(paint.name)}
                  className="px-3 py-1 bg-gradient-to-r from-gray-600 to-gray-500 text-white text-xs font-semibold rounded-lg active:scale-95 transition-transform"
                  title="Remove from Wishlist"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Listed message */}
        {paint.status === 'listed' && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
              Paint reference - use the buttons above to add to collection or wishlist
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-5 pt-0 flex gap-2 justify-end">
        {/* Always show dropdown menu */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="px-3 py-2 bg-gradient-to-r from-gray-600 to-gray-500 text-white text-sm font-semibold rounded-xl active:scale-95 transition-transform"
            title="More actions"
          >
            <MoreVertical size={14} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 bottom-full mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 min-w-48">
              {/* Only show "Remove from Collection" for collection paints */}
              {paint.status === 'collection' && (
                <button
                  onClick={() => {
                    onMoveToListed(paint.name);
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-xl"
                >
                  Remove from Collection
                </button>
              )}
              <button
                onClick={() => {
                  onDelete(paint.name);
                  setShowDropdown(false);
                }}
                className={`w-full px-4 py-3 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 ${
                  paint.status === 'collection' ? 'rounded-b-xl' : 'rounded-xl'
                }`}
              >
                Delete
              </button>
            </div>
          )}

          {/* Backdrop to close dropdown */}
          {showDropdown && (
            <div
              className="fixed inset-0 z-0"
              onClick={() => setShowDropdown(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PaintCard;