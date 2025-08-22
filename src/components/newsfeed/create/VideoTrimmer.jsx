// src/components/newsfeed/create/VideoTrimmer.jsx - Fixed video trimming interface
import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Play, Pause, Scissors, Check, X, RotateCcw } from 'lucide-react';

const VideoTrimmer = ({ file, onTrimComplete, onCancel, onSkip }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const playerRef = useRef(null);

  // Handle when player is ready
  const handleReady = () => {
    console.log('Video ready');
    setIsReady(true);
    // Try to get duration immediately
    if (playerRef.current) {
      const videoDuration = playerRef.current.getDuration();
      if (videoDuration) {
        setDuration(videoDuration);
        setEndTime(videoDuration);
      }
    }
  };

  // Handle duration change
  const handleDurationChange = (videoDuration) => {
    console.log('Duration received:', videoDuration);
    setDuration(videoDuration);
    setEndTime(videoDuration);
  };

  // Update current time during playback
  const handleTimeUpdate = ({ currentTime }) => {
    setCurrentTime(currentTime);

    // Pause when reaching end time
    if (currentTime >= endTime) {
      setIsPlaying(false);
    }
  };

  // Handle errors
  const handleError = (error) => {
    console.error('ReactPlayer error:', error);
    setIsReady(false);
  };

  // Format time helper
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle trim range changes
  const handleStartTimeChange = (value) => {
    const newStartTime = parseFloat(value);
    setStartTime(newStartTime);

    // Ensure end time is after start time
    if (newStartTime >= endTime) {
      setEndTime(Math.min(newStartTime + 1, duration));
    }

    // Seek to new start time
    if (playerRef.current) {
      playerRef.current.seekTo(newStartTime);
      setCurrentTime(newStartTime);
    }
  };

  const handleEndTimeChange = (value) => {
    const newEndTime = parseFloat(value);
    setEndTime(newEndTime);

    // Ensure start time is before end time
    if (newEndTime <= startTime) {
      setStartTime(Math.max(newEndTime - 1, 0));
    }
  };

  // Playback controls
  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      // If at end, restart from beginning of selection
      if (currentTime >= endTime) {
        playerRef.current?.seekTo(startTime);
      }
      setIsPlaying(true);
    }
  };

  const handleSeekToStart = () => {
    playerRef.current?.seekTo(startTime);
    setCurrentTime(startTime);
  };

  const handleSeekToEnd = () => {
    playerRef.current?.seekTo(endTime);
    setCurrentTime(endTime);
  };

  // Handle trim confirmation
  const handleConfirmTrim = () => {
    const trimData = {
      start: startTime,
      end: endTime,
      duration: endTime - startTime
    };
    onTrimComplete(trimData);
  };

  // Calculate trim duration
  const trimDuration = endTime - startTime;
  const isValidTrim = trimDuration > 0.5 && trimDuration <= 300; // 0.5s to 5min

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Scissors className="text-purple-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Trim Video
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Select the part of your video you want to share (max 5 minutes)
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          File: {file.fileName}
        </p>
      </div>

      {/* Video Player */}
      <div className="bg-black rounded-lg overflow-hidden">
        <div className="relative" style={{ paddingTop: '56.25%' }}>
          <ReactPlayer
            ref={playerRef}
            url={file.previewUrl}
            width="100%"
            height="100%"
            style={{ position: 'absolute', top: 0, left: 0 }}
            playing={isPlaying}
            muted={true}
            onReady={handleReady}
            onTimeUpdate={handleTimeUpdate}
            onDurationChange={handleDurationChange}
            onError={handleError}
            progressInterval={100}
            controls={false}
            config={{
              file: {
                attributes: {
                  preload: 'metadata'
                }
              }
            }}
          />

          {/* Play/Pause Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={handlePlayPause}
              disabled={!isReady}
              className="w-16 h-16 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center text-white transition-all disabled:opacity-50"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
          </div>

          {/* Loading indicator */}
          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>

      {/* Trim Controls */}
      {isReady && duration > 0 && (
        <div className="space-y-4">
          {/* Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Trim Selection</span>
              <span className={`font-mono ${isValidTrim ? 'text-green-600' : 'text-red-600'}`}>
                {formatTime(trimDuration)}
              </span>
            </div>

            {/* Visual Timeline */}
            <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded">
              {/* Full timeline */}
              <div className="absolute inset-0 bg-gray-300 dark:bg-gray-600 rounded"></div>

              {/* Selected range */}
              <div
                className="absolute h-full bg-purple-500 rounded"
                style={{
                  left: `${(startTime / duration) * 100}%`,
                  width: `${((endTime - startTime) / duration) * 100}%`
                }}
              ></div>

              {/* Current time indicator */}
              <div
                className="absolute w-1 h-full bg-white shadow-sm"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Start Time Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Start Time
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSeekToStart}
                  className="btn-tertiary btn-sm"
                  title="Jump to start"
                >
                  ⮐
                </button>
                <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                  {formatTime(startTime)}
                </span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max={duration}
              step="0.1"
              value={startTime}
              onChange={(e) => handleStartTimeChange(e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>

          {/* End Time Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                End Time
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSeekToEnd}
                  className="btn-tertiary btn-sm"
                  title="Jump to end"
                >
                  ⮑
                </button>
                <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                  {formatTime(endTime)}
                </span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max={duration}
              step="0.1"
              value={endTime}
              onChange={(e) => handleEndTimeChange(e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                setStartTime(0);
                setEndTime(Math.min(30, duration));
                playerRef.current?.seekTo(0);
              }}
              className="btn-tertiary btn-sm"
            >
              First 30s
            </button>
            <button
              onClick={() => {
                const start = Math.max(0, duration - 30);
                setStartTime(start);
                setEndTime(duration);
                playerRef.current?.seekTo(start);
              }}
              className="btn-tertiary btn-sm"
            >
              Last 30s
            </button>
            <button
              onClick={() => {
                setStartTime(0);
                setEndTime(duration);
                playerRef.current?.seekTo(0);
              }}
              className="btn-tertiary btn-sm"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>

          {/* Validation Message */}
          {!isValidTrim && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                {trimDuration <= 0.5 ?
                  'Selection must be at least 0.5 seconds long' :
                  'Selection must be 5 minutes or less'
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Loading state for video */}
      {!isReady && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading video...</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onCancel}
          className="btn-secondary btn-md flex-1"
        >
          <X size={16} />
          Cancel
        </button>

        {onSkip && (
          <button
            onClick={onSkip}
            className="btn-tertiary btn-md flex-1"
          >
            Skip Trimming
          </button>
        )}

        <button
          onClick={handleConfirmTrim}
          disabled={!isValidTrim || !isReady}
          className="btn-primary btn-md flex-1"
        >
          <Check size={16} />
          Apply Trim
        </button>
      </div>
    </div>
  );
};

export default VideoTrimmer;