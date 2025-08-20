// hooks/shared/useResponsivePageSize.js
import { useState, useEffect } from 'react';

export const useResponsivePageSize = () => {
  const [pageSize, setPageSize] = useState(12); // Default for desktop

  useEffect(() => {
    const calculatePageSize = () => {
      const width = window.innerWidth;

      if (width < 640) {
        // Mobile: 1 column grid, 7 items for full screen
        setPageSize(7);
      } else if (width < 768) {
        // Small tablet: 2 columns, 8 items (4 rows)
        setPageSize(8);
      } else if (width < 1024) {
        // Tablet: 2-3 columns, 9 items (3 rows)
        setPageSize(9);
      } else if (width < 1280) {
        // Small desktop: 3 columns, 12 items (4 rows)
        setPageSize(12);
      } else if (width < 1536) {
        // Large desktop: 4 columns, 16 items (4 rows)
        setPageSize(16);
      } else {
        // Extra large: 4+ columns, 20 items (4-5 rows)
        setPageSize(20);
      }
    };

    // Calculate initial size
    calculatePageSize();

    // Recalculate on window resize with debounce
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(calculatePageSize, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return pageSize;
};