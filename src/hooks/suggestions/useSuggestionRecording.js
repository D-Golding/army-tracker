// hooks/suggestions/useSuggestionRecording.js
// React hook for recording suggestion usage and batch operations

import { useState, useCallback, useRef } from 'react';
import {
  recordFactionUsage,
  recordUnitUsage,
  recordManufacturerUsage,
  recordGameUsage,
  recordBatchUsage,
  recordProjectCreationSuggestions
} from '../../services/suggestions/index.js';

export const useSuggestionRecording = (options = {}) => {
  const {
    autoRecord = true,
    batchDelay = 1000, // Delay before auto-submitting batch
    maxBatchSize = 10
  } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [recordingStats, setRecordingStats] = useState({
    totalRecorded: 0,
    successCount: 0,
    errorCount: 0,
    lastError: null
  });

  // Batch recording state
  const [pendingRecordings, setPendingRecordings] = useState([]);
  const batchTimeoutRef = useRef(null);

  // Update stats helper
  const updateStats = useCallback((success, error = null) => {
    setRecordingStats(prev => ({
      totalRecorded: prev.totalRecorded + 1,
      successCount: prev.successCount + (success ? 1 : 0),
      errorCount: prev.errorCount + (success ? 0 : 1),
      lastError: error
    }));
  }, []);

  // Record faction usage
  const recordFaction = useCallback(async (manufacturer, game, faction, metadata = {}) => {
    if (!autoRecord) return { recorded: false, reason: 'Auto-record disabled' };

    setIsRecording(true);
    try {
      const result = await recordFactionUsage(manufacturer, game, faction, metadata);
      updateStats(result.recorded);
      return result;
    } catch (error) {
      console.error('Error recording faction:', error);
      updateStats(false, error.message);
      return { recorded: false, reason: 'Recording failed', error: error.message };
    } finally {
      setIsRecording(false);
    }
  }, [autoRecord, updateStats]);

  // Record unit usage
  const recordUnit = useCallback(async (manufacturer, game, faction, unitName, metadata = {}) => {
    if (!autoRecord) return { recorded: false, reason: 'Auto-record disabled' };

    setIsRecording(true);
    try {
      const result = await recordUnitUsage(manufacturer, game, faction, unitName, metadata);
      updateStats(result.recorded);
      return result;
    } catch (error) {
      console.error('Error recording unit:', error);
      updateStats(false, error.message);
      return { recorded: false, reason: 'Recording failed', error: error.message };
    } finally {
      setIsRecording(false);
    }
  }, [autoRecord, updateStats]);

  // Record manufacturer usage
  const recordManufacturer = useCallback(async (manufacturer, context = 'general', metadata = {}) => {
    if (!autoRecord) return { recorded: false, reason: 'Auto-record disabled' };

    setIsRecording(true);
    try {
      const result = await recordManufacturerUsage(manufacturer, context, metadata);
      updateStats(result.recorded);
      return result;
    } catch (error) {
      console.error('Error recording manufacturer:', error);
      updateStats(false, error.message);
      return { recorded: false, reason: 'Recording failed', error: error.message };
    } finally {
      setIsRecording(false);
    }
  }, [autoRecord, updateStats]);

  // Record game usage
  const recordGame = useCallback(async (manufacturer, game, metadata = {}) => {
    if (!autoRecord) return { recorded: false, reason: 'Auto-record disabled' };

    setIsRecording(true);
    try {
      const result = await recordGameUsage(manufacturer, game, metadata);
      updateStats(result.recorded);
      return result;
    } catch (error) {
      console.error('Error recording game:', error);
      updateStats(false, error.message);
      return { recorded: false, reason: 'Recording failed', error: error.message };
    } finally {
      setIsRecording(false);
    }
  }, [autoRecord, updateStats]);

  // Add recording to batch queue
  const addToBatch = useCallback((recordingData) => {
    setPendingRecordings(prev => {
      const updated = [...prev, {
        ...recordingData,
        id: Date.now() + Math.random(),
        addedAt: Date.now()
      }];

      // Auto-submit if batch is full
      if (updated.length >= maxBatchSize) {
        // Clear timeout since we're submitting immediately
        if (batchTimeoutRef.current) {
          clearTimeout(batchTimeoutRef.current);
          batchTimeoutRef.current = null;
        }

        // Submit batch on next tick
        setTimeout(() => submitBatch(), 0);
        return updated;
      }

      // Set/reset batch submission timeout
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }

      batchTimeoutRef.current = setTimeout(() => {
        submitBatch();
      }, batchDelay);

      return updated;
    });
  }, [maxBatchSize, batchDelay]);

  // Submit batch recordings
  const submitBatch = useCallback(async () => {
    if (pendingRecordings.length === 0) return { submitted: false, reason: 'No pending recordings' };

    setIsRecording(true);

    // Clear timeout
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
      batchTimeoutRef.current = null;
    }

    try {
      const batch = [...pendingRecordings];
      setPendingRecordings([]); // Clear pending immediately

      const result = await recordBatchUsage(batch);

      // Update stats
      setRecordingStats(prev => ({
        totalRecorded: prev.totalRecorded + result.total,
        successCount: prev.successCount + result.successful,
        errorCount: prev.errorCount + result.failed,
        lastError: result.failed > 0 ? 'Some batch recordings failed' : prev.lastError
      }));

      console.log(`📝 Batch submitted: ${result.successful}/${result.total} successful`);
      return result;
    } catch (error) {
      console.error('Error submitting batch:', error);
      updateStats(false, error.message);

      // Re-add failed recordings to queue
      setPendingRecordings(prev => [...prev, ...pendingRecordings]);
      return { submitted: false, reason: 'Batch submission failed', error: error.message };
    } finally {
      setIsRecording(false);
    }
  }, [pendingRecordings, updateStats]);

  // Clear batch queue
  const clearBatch = useCallback(() => {
    setPendingRecordings([]);
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
      batchTimeoutRef.current = null;
    }
  }, []);

  // Record project creation (convenience method)
  const recordProjectCreation = useCallback(async (projectData) => {
    if (!autoRecord) return { recorded: false, reason: 'Auto-record disabled' };

    setIsRecording(true);
    try {
      const result = await recordProjectCreationSuggestions(projectData);

      if (result.results) {
        const successCount = result.results.filter(r => r.recorded).length;
        const errorCount = result.results.length - successCount;

        setRecordingStats(prev => ({
          totalRecorded: prev.totalRecorded + result.total,
          successCount: prev.successCount + successCount,
          errorCount: prev.errorCount + errorCount,
          lastError: errorCount > 0 ? 'Some project recordings failed' : prev.lastError
        }));
      }

      return result;
    } catch (error) {
      console.error('Error recording project creation:', error);
      updateStats(false, error.message);
      return { recorded: false, reason: 'Recording failed', error: error.message };
    } finally {
      setIsRecording(false);
    }
  }, [autoRecord, updateStats]);

  // Batch convenience methods
  const addFactionToBatch = useCallback((manufacturer, game, faction, metadata = {}) => {
    addToBatch({
      type: 'faction',
      manufacturer,
      game,
      value: faction,
      metadata
    });
  }, [addToBatch]);

  const addUnitToBatch = useCallback((manufacturer, game, faction, unitName, metadata = {}) => {
    addToBatch({
      type: 'unit',
      manufacturer,
      game,
      faction,
      value: unitName,
      metadata
    });
  }, [addToBatch]);

  const addManufacturerToBatch = useCallback((manufacturer, metadata = {}) => {
    addToBatch({
      type: 'manufacturer',
      value: manufacturer,
      metadata
    });
  }, [addToBatch]);

  const addGameToBatch = useCallback((manufacturer, game, metadata = {}) => {
    addToBatch({
      type: 'game',
      manufacturer,
      value: game,
      metadata
    });
  }, [addToBatch]);

  // Reset stats
  const resetStats = useCallback(() => {
    setRecordingStats({
      totalRecorded: 0,
      successCount: 0,
      errorCount: 0,
      lastError: null
    });
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    isRecording,
    recordingStats,
    pendingRecordings,
    hasPendingRecordings: pendingRecordings.length > 0,
    pendingCount: pendingRecordings.length,

    // Direct recording methods
    recordFaction,
    recordUnit,
    recordManufacturer,
    recordGame,
    recordProjectCreation,

    // Batch recording methods
    addToBatch,
    addFactionToBatch,
    addUnitToBatch,
    addManufacturerToBatch,
    addGameToBatch,
    submitBatch,
    clearBatch,

    // Utilities
    resetStats,

    // Status helpers
    getSuccessRate: () => {
      const total = recordingStats.totalRecorded;
      return total > 0 ? Math.round((recordingStats.successCount / total) * 100) : 0;
    },

    hasErrors: recordingStats.errorCount > 0,
    lastError: recordingStats.lastError,

    // Config
    config: {
      autoRecord,
      batchDelay,
      maxBatchSize
    }
  };
};

// Hook for project form integration
export const useProjectSuggestionRecording = (projectData = {}) => {
  const recording = useSuggestionRecording({
    autoRecord: true,
    batchDelay: 2000, // Longer delay for project forms
    maxBatchSize: 5
  });

  // Record all project-related suggestions when project data changes
  const recordProjectSuggestions = useCallback(() => {
    const { manufacturer, game, faction, unitName } = projectData;

    if (manufacturer && manufacturer !== 'custom') {
      recording.addManufacturerToBatch(manufacturer, { context: 'project_creation' });
    }

    if (manufacturer && game && game !== 'custom') {
      recording.addGameToBatch(manufacturer, game, { context: 'project_creation' });
    }

    if (manufacturer && game && faction) {
      recording.addFactionToBatch(manufacturer, game, faction, { context: 'project_creation' });
    }

    if (manufacturer && game && faction && unitName) {
      recording.addUnitToBatch(manufacturer, game, faction, unitName, { context: 'project_creation' });
    }
  }, [projectData, recording]);

  return {
    ...recording,
    recordProjectSuggestions
  };
};