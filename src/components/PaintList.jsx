// components/PaintList.jsx - Completely refactored with React Query
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import PaintCard from './PaintCard';
import SummaryCards from './SummaryCards';
import AddPaintForm from './AddPaintForm';
import { usePaintListData, usePaintOperations } from '../hooks/usePaints';

const PaintList = () => {
  const [filter, setFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // Get all paint data and operations via React Query hooks
  const { paints, summary, isLoading, isError, error } = usePaintListData(filter);
  const {
    addPaint,
    deletePaint,
    refillPaint,
    reducePaint,
    moveToCollection,
    moveToWishlist,
    moveToListed,
    isLoading: isOperationLoading
  } = usePaintOperations();

  // Handle filter clicks from summary cards
  const handleFilterClick = (filterType) => {
    setFilter(filterType);
  };

  // Handle adding new paint with proper async/await
  const handleAddPaint = async (paintData) => {
    try {
      console.log('PaintList.handleAddPaint - received paintData:', paintData);

      const dataToSend = {
        brand: paintData.brand,
        airbrush: paintData.airbrush,
        type: paintData.type,
        name: paintData.name,
        status: paintData.status,
        level: paintData.level,
        photoURL: null, // No photo URL for now
        sprayPaint: paintData.sprayPaint
      };

      console.log('PaintList.handleAddPaint - sending to addPaint:', dataToSend);

      await addPaint(dataToSend);

      setShowAddForm(false);

      // No need to manually reload - React Query handles this automatically!
    } catch (error) {
      console.error('Error adding paint:', error);
      // You could add toast notification here
    }
  };

  // Handle paint operations with proper async/await
  const handleReducePaint = async (paintName) => {
    try {
      await reducePaint(paintName);
    } catch (error) {
      console.error('Error reducing paint level:', error);
    }
  };

  const handleMoveToCollection = async (paintName) => {
    try {
      await moveToCollection(paintName);
    } catch (error) {
      console.error('Error moving to collection:', error);
    }
  };

  const handleMoveToWishlist = async (paintName) => {
    try {
      await moveToWishlist(paintName);
    } catch (error) {
      console.error('Error moving to wishlist:', error);
    }
  };

  const handleMoveToListed = async (paintName) => {
    try {
      await moveToListed(paintName);
    } catch (error) {
      console.error('Error moving to listed:', error);
    }
  };

  const handleRefill = async (paintName) => {
    try {
      await refillPaint(paintName);
    } catch (error) {
      console.error('Error refilling paint:', error);
    }
  };

  const handleDelete = async (paintName) => {
    try {
      await deletePaint(paintName);
    } catch (error) {
      console.error('Error deleting paint:', error);
    }
  };

  // Show error state
  if (isError) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 dark:text-red-400 mb-4">
          Error loading paints: {error?.message || 'Unknown error'}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary btn-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Summary Cards - Now clickable */}
      <SummaryCards summary={summary} onFilterClick={handleFilterClick} />

      {/* Filter Chips */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {[
          { key: 'all', label: 'All Paints' },
          { key: 'collection', label: 'Collection' },
          { key: 'wishlist', label: 'Wishlist' },
          { key: 'airbrush', label: 'Airbrush' },
          { key: 'almostempty', label: 'Almost Empty' }
        ].map((filterOption) => (
          <button
            key={filterOption.key}
            onClick={() => setFilter(filterOption.key)}
            className={`filter-chip ${
              filter === filterOption.key ? 'filter-chip-active' : 'filter-chip-inactive'
            }`}
          >
            {filterOption.label}
          </button>
        ))}
      </div>

      {/* Add Paint Button */}
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        disabled={isOperationLoading}
        className="btn-secondary btn-md w-full mb-4"
      >
        <Plus className="inline-block mr-2" size={20} />
        {showAddForm ? 'Cancel' : 'Add New Paint'}
      </button>

      {/* Add Paint Form */}
      {showAddForm && (
        <AddPaintForm
          onAddPaint={handleAddPaint}
          loading={isOperationLoading}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="loading-spinner-primary mx-auto mb-4"></div>
          <div className="text-gray-600 dark:text-gray-400">Loading paints...</div>
        </div>
      ) : (
        <>
          {/* Paint Cards */}
          <div className="space-y-4">
            {paints.map((paint) => (
              <PaintCard
                key={paint.id}
                paint={paint}
                onRefill={handleRefill}
                onReducePaint={handleReducePaint}
                onMoveToCollection={handleMoveToCollection}
                onMoveToWishlist={handleMoveToWishlist}
                onMoveToListed={handleMoveToListed}
                onDelete={handleDelete}
                disabled={isOperationLoading}
              />
            ))}
          </div>

          {/* Empty State */}
          {paints.length === 0 && (
            <div className="empty-state">
              {filter === 'all' ? 'No paints found' :
               filter === 'collection' ? 'No paints in your collection' :
               filter === 'wishlist' ? 'No paints on your wishlist' :
               filter === 'airbrush' ? 'No airbrush paints found' :
               'No almost empty paints found'}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PaintList;