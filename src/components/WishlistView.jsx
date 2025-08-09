// components/WishlistView.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import {
  getWishlistPaints,
  addToWishlist,
  removeFromWishlist,
  markAsPurchased
} from '../services/wishlistService.js';

const WishlistView = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Predefined options for dropdowns
  const brandOptions = ['Citadel Colour', 'Army Painter'];
  const typeOptions = ['Layer', 'Dry', 'Technical', 'Acrylic', 'Wash', 'Metallic', 'Effects', 'Base', 'Shade'];

  // Form state for adding new wishlist item
  const [newWishlistForm, setNewWishlistForm] = useState({
    brand: '',
    customBrand: '',
    type: '',
    customType: '',
    name: '',
    airbrush: false,
    sprayPaint: false,
    notes: ''
  });

  // Load wishlist items
  const loadWishlist = async () => {
    setLoading(true);
    try {
      const wishlistData = await getWishlistPaints();
      setWishlistItems(wishlistData);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
    setLoading(false);
  };

  // Load data when component mounts
  useEffect(() => {
    loadWishlist();
  }, []);

  // Handle adding new wishlist item
  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Use custom values if provided, otherwise use selected dropdown values
      const finalBrand = newWishlistForm.brand === 'custom' ? newWishlistForm.customBrand : newWishlistForm.brand;
      const finalType = newWishlistForm.type === 'custom' ? newWishlistForm.customType : newWishlistForm.type;

      await addToWishlist(
        finalBrand,
        finalType,
        newWishlistForm.name,
        newWishlistForm.airbrush,
        newWishlistForm.sprayPaint,
        newWishlistForm.notes
      );

      // Reset form
      setNewWishlistForm({
        brand: '',
        customBrand: '',
        type: '',
        customType: '',
        name: '',
        airbrush: false,
        sprayPaint: false,
        notes: ''
      });
      setShowAddForm(false);

      // Reload data
      await loadWishlist();
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
    setLoading(false);
  };

  // Handle marking as purchased (moves to paint inventory)
  const handleMarkAsPurchased = async (wishlistId) => {
    try {
      await markAsPurchased(wishlistId);
      await loadWishlist();
    } catch (error) {
      console.error('Error marking as purchased:', error);
    }
  };

  // Handle removing from wishlist
  const handleRemoveFromWishlist = async (wishlistId) => {
    if (window.confirm('Are you sure you want to remove this item from your wishlist?')) {
      try {
        await removeFromWishlist(wishlistId);
        await loadWishlist();
      } catch (error) {
        console.error('Error removing from wishlist:', error);
      }
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Paint Wishlist</h2>
        <p className="text-gray-600 dark:text-gray-400">Paints you want to buy in the future</p>
      </div>

      {/* Add to Wishlist Button */}
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="w-full mb-4 p-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all active:scale-98"
      >
        <Plus className="inline-block mr-2" size={20} />
        {showAddForm ? 'Cancel' : 'Add to Wishlist'}
      </button>

      {/* Add to Wishlist Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl mb-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Add to Wishlist</h3>
          <form onSubmit={handleAddToWishlist} className="space-y-4">

            {/* Brand Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand</label>
              <select
                value={newWishlistForm.brand}
                onChange={(e) => setNewWishlistForm({...newWishlistForm, brand: e.target.value, customBrand: ''})}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Select Brand</option>
                {brandOptions.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
                <option value="custom">Add Your Own...</option>
              </select>
              {newWishlistForm.brand === 'custom' && (
                <input
                  type="text"
                  placeholder="Enter custom brand"
                  value={newWishlistForm.customBrand}
                  onChange={(e) => setNewWishlistForm({...newWishlistForm, customBrand: e.target.value})}
                  className="w-full mt-2 p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              )}
            </div>

            {/* Type Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
              <select
                value={newWishlistForm.type}
                onChange={(e) => setNewWishlistForm({...newWishlistForm, type: e.target.value, customType: ''})}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Select Type</option>
                {typeOptions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
                <option value="custom">Add Your Own...</option>
              </select>
              {newWishlistForm.type === 'custom' && (
                <input
                  type="text"
                  placeholder="Enter custom type"
                  value={newWishlistForm.customType}
                  onChange={(e) => setNewWishlistForm({...newWishlistForm, customType: e.target.value})}
                  className="w-full mt-2 p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              )}
            </div>

            {/* Paint Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Paint Name</label>
              <input
                type="text"
                placeholder="Paint Name"
                value={newWishlistForm.name}
                onChange={(e) => setNewWishlistForm({...newWishlistForm, name: e.target.value})}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes (optional)</label>
              <textarea
                placeholder="Why do you want this paint? What project is it for?"
                value={newWishlistForm.notes}
                onChange={(e) => setNewWishlistForm({...newWishlistForm, notes: e.target.value})}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows="3"
              />
            </div>

            {/* Checkboxes */}
            <div className="grid grid-cols-1 gap-4">
              <label className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={newWishlistForm.airbrush}
                  onChange={(e) => setNewWishlistForm({...newWishlistForm, airbrush: e.target.checked})}
                  className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="font-medium">Airbrush Compatible</span>
              </label>

              <label className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={newWishlistForm.sprayPaint}
                  onChange={(e) => setNewWishlistForm({...newWishlistForm, sprayPaint: e.target.checked})}
                  className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="font-medium">Spray Paint</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl font-semibold disabled:opacity-50 hover:shadow-lg transition-all"
            >
              {loading ? 'Adding...' : 'Add to Wishlist'}
            </button>
          </form>
        </div>
      )}

      {/* Wishlist Items */}
      {loading ? (
        <div className="text-center py-8">
          <div className="text-gray-600 dark:text-gray-400">Loading wishlist...</div>
        </div>
      ) : (
        <div className="space-y-4">
          {wishlistItems.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{item.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{item.brand} • {item.type}</p>
                    {item.notes && (
                      <p className="text-gray-500 dark:text-gray-500 text-sm mt-1 italic">"{item.notes}"</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    {item.airbrush && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-lg font-medium">
                        Airbrush
                      </span>
                    )}
                    {item.sprayPaint && (
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs rounded-lg font-medium">
                        Spray
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleMarkAsPurchased(item.id)}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-semibold rounded-xl active:scale-95 transition-transform"
                  >
                    <Check className="inline-block mr-1" size={14} />
                    Mark as Purchased
                  </button>
                  <button
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    className="px-4 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white text-sm font-semibold rounded-xl active:scale-95 transition-transform"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {wishlistItems.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400">
            Your wishlist is empty. Add some paints you want to buy!
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistView;