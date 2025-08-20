// hooks/paints/usePaintListState.js
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../useSubscription';
import { usePaintListDataPaginated } from './usePaintQueries';
import { useResponsivePageSize } from '../shared/useResponsivePageSize';

export const usePaintListState = (activeFilters) => {
  // UI state
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Bulk delete state
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);
  const [selectedPaints, setSelectedPaints] = useState(new Set());

  // Get responsive page size and auth data
  const responsivePageSize = useResponsivePageSize();
  const { userProfile } = useAuth();
  const { limits } = useSubscription();

  // Get paginated paint data
  const basicFilter = activeFilters.basicFilter || 'all';
  const paintQuery = usePaintListDataPaginated(basicFilter, responsivePageSize);

  // Calculate limits
  const paintLimit = limits.paints;
  const totalPaintsCount = paintQuery.summary?.total || 0;
  const hasReachedPaintLimit = totalPaintsCount >= paintLimit;
  const currentTier = userProfile?.subscription?.tier || 'free';

  // Handle scroll for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Bulk delete helpers
  const toggleBulkDeleteMode = async () => {
    if (!bulkDeleteMode) {
      // When entering bulk delete mode, ensure we have all paints loaded
      const { queryClient, queryKeys } = await import('../../lib/queryClient');
      const { getAllPaints } = await import('../../services/paints/index.js');

      await queryClient.ensureQueryData({
        queryKey: queryKeys.paints.list('all'),
        queryFn: () => getAllPaints(),
        staleTime: 5 * 60 * 1000,
      });
    }

    setBulkDeleteMode(!bulkDeleteMode);
    setSelectedPaints(new Set());
  };

  const togglePaintSelection = (paintName) => {
    const newSelected = new Set(selectedPaints);
    if (newSelected.has(paintName)) {
      newSelected.delete(paintName);
    } else {
      newSelected.add(paintName);
    }
    setSelectedPaints(newSelected);
  };

  const selectAllFilteredPaints = async (filteredPaints) => {
    const shouldUseAllPaints = bulkDeleteMode && Object.keys(activeFilters).length === 0;

    if (shouldUseAllPaints) {
      // Get all paints from cache
      const { queryClient, queryKeys } = await import('../../lib/queryClient');
      const allPaintsData = queryClient.getQueryData(queryKeys.paints.list('all'));
      const allPaintNames = new Set((allPaintsData || []).map(paint => paint.name));
      setSelectedPaints(allPaintNames);
    } else {
      // Use filtered paints
      const allFilteredNames = new Set(filteredPaints.map(paint => paint.name));
      setSelectedPaints(allFilteredNames);
    }
  };

  const deselectAllPaints = () => {
    setSelectedPaints(new Set());
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return {
    // Data from paint query
    paints: paintQuery.paints,
    summary: paintQuery.summary,
    isLoading: paintQuery.isLoading,
    isError: paintQuery.isError,
    error: paintQuery.error,
    hasNextPage: paintQuery.hasNextPage,
    fetchNextPage: paintQuery.fetchNextPage,
    isFetchingNextPage: paintQuery.isFetchingNextPage,
    refetch: paintQuery.refetch,

    // Calculated values
    totalPaintsCount,
    hasReachedPaintLimit,
    currentTier,
    paintLimit,
    responsivePageSize,

    // UI state
    showAddForm,
    setShowAddForm,
    showDisclaimer,
    setShowDisclaimer,
    showUpgradeModal,
    setShowUpgradeModal,
    showDeleteConfirm,
    setShowDeleteConfirm,
    showBackToTop,

    // Bulk delete state
    bulkDeleteMode,
    selectedPaints,
    toggleBulkDeleteMode,
    togglePaintSelection,
    selectAllFilteredPaints,
    deselectAllPaints,

    // Actions
    scrollToTop,
  };
};