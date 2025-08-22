// src/components/newsfeed/VideoPlayer.jsx - Smart aspect ratio video player
import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';

const VideoPlayer = ({
  video,
  isInView = false,
  className = '',
  showControls = true,
  autoPlay = true,
  muted = true
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [showControlsOverlay, setShowControlsOverlay] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(16/9); // Default to landscape
  const [isPortrait, setIsPortrait] = useState(false);

  const playerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const videoRef = useRef(null);

  // Detect video dimensions when loaded
  const handleVideoReady = () => {
    const player = playerRef.current;
    if (player && player.getInternalPlayer) {
      const internalPlayer = player.getInternalPlayer();
      if (internalPlayer && internalPlayer.videoWidth && internalPlayer.videoHeight) {
        const width = internalPlayer.videoWidth;
        const height = internalPlayer.videoHeight;
        const ratio = width / height;

        console.log(`📹 Video dimensions: ${width}x${height}, ratio: ${ratio}`);

        setAspectRatio(ratio);
        setIsPortrait(ratio < 1); // Portrait if height > width
      }
    }
  };

  // Alternative method using video element directly
  const handleVideoLoadedMetadata = (e) => {
    if (e.target && e.target.videoWidth && e.target.videoHeight) {
      const width = e.target.videoWidth;
      const height = e.target.videoHeight;
      const ratio = width / height;

      console.log(`📹 Video dimensions: ${width}x${height}, ratio: ${ratio}`);

      setAspectRatio(ratio);
      setIsPortrait(ratio < 1);
    }
  };

  // Auto-play when in view
  useEffect(() => {
    if (autoPlay && isInView && !isPlaying) {
      setIsPlaying(true);
    } else if (!isInView && isPlaying) {
      setIsPlaying(false);
    }
  }, [isInView, autoPlay, isPlaying]);

  // Handle play/pause toggle
  const handlePlayPause = (e) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
    showControlsTemporarily();
  };

  // Handle mute toggle
  const handleMuteToggle = (e) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
    showControlsTemporarily();
  };

  // Handle fullscreen
  const handleFullscreen = (e) => {
    e.stopPropagation();
    const playerElement = playerRef.current?.wrapper;
    if (playerElement) {
      if (playerElement.requestFullscreen) {
        playerElement.requestFullscreen();
      } else if (playerElement.webkitRequestFullscreen) {
        playerElement.webkitRequestFullscreen();
      } else if (playerElement.msRequestFullscreen) {
        playerElement.msRequestFullscreen();
      }
    }
    showControlsTemporarily();
  };

  // Show controls temporarily
  const showControlsTemporarily = () => {
    setShowControlsOverlay(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (!isHovered) {
        setShowControlsOverlay(false);
      }
    }, 3000);
  };

  // Handle mouse enter
  const handleMouseEnter = () => {
    setIsHovered(true);
    setShowControlsOverlay(true);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setIsHovered(false);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControlsOverlay(false);
    }, 1000);
  };

  // Handle video click
  const handleVideoClick = (e) => {
    e.stopPropagation();
    if (showControls) {
      handlePlayPause(e);
    }
  };

  // Handle progress update
  const handleProgress = ({ played }) => {
    setProgress(played);
  };

  // Handle duration
  const handleDuration = (duration) => {
    setDuration(duration);
  };

  // Handle video end
  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate container styles based on aspect ratio
  const getContainerStyles = () => {
    if (isPortrait) {
      // Portrait video - make container taller
      return {
        width: '100%',
        maxWidth: '400px', // Limit width for portrait
        margin: '0 auto',
        aspectRatio: `${aspectRatio}`, // Use actual aspect ratio
        minHeight: '500px', // Ensure minimum height for portrait
        maxHeight: '80vh'
      };
    } else {
      // Landscape video - normal width
      return {
        width: '100%',
        aspectRatio: `${aspectRatio}`, // Use actual aspect ratio
        maxHeight: '60vh'
      };
    }
  };

  return (
    <div
      className={`relative bg-black rounded-lg overflow-hidden ${className}`}
      style={getContainerStyles()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleVideoClick}
    >
      {/* Video Player */}
      <ReactPlayer
        ref={playerRef}
        url={video.url}
        width="100%"
        height="100%"
        playing={isPlaying}
        muted={isMuted}
        loop={true}
        playsinline={true}
        controls={false}
        onProgress={handleProgress}
        onDuration={handleDuration}
        onEnded={handleEnded}
        onReady={handleVideoReady}
        config={{
          file: {
            attributes: {
              preload: 'metadata',
              playsInline: true,
              onLoadedMetadata: handleVideoLoadedMetadata,
              style: {
                width: '100%',
                height: '100%',
                objectFit: 'cover' // Fill container while maintaining aspect ratio
              }
            }
          }
        }}
      />

      {/* Video Overlay Info */}
      <div className="absolute top-3 left-3 flex items-center gap-2">
        {/* Video Type Badge */}
        <div className="bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs font-medium">
          VIDEO {isPortrait ? '📱' : '🖥️'}
        </div>

        {/* Duration Badge */}
        {duration > 0 && (
          <div className="bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs font-mono">
            {formatTime(duration)}
          </div>
        )}
      </div>

      {/* Controls Overlay */}
      {showControls && (showControlsOverlay || !isPlaying) && (
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
          {/* Center Play/Pause Button */}
          <button
            onClick={handlePlayPause}
            className="w-16 h-16 bg-black bg-opacity-60 hover:bg-opacity-80 rounded-full flex items-center justify-center text-white transition-all transform hover:scale-105"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
          </button>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            {/* Progress Bar */}
            <div className="w-full bg-white bg-opacity-30 rounded-full h-1 mb-3">
              <div
                className="bg-white h-1 rounded-full transition-all"
                style={{ width: `${progress * 100}%` }}
              ></div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePlayPause}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>

                <button
                  onClick={handleMuteToggle}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>

                {/* Time Display */}
                {duration > 0 && (
                  <div className="text-white text-sm font-mono">
                    {formatTime(progress * duration)} / {formatTime(duration)}
                  </div>
                )}
              </div>

              <button
                onClick={handleFullscreen}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <Maximize2 size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {!isPlaying && progress === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Video Title/Description Overlay (if provided) */}
      {(video.title || video.description) && showControlsOverlay && (
        <div className="absolute top-12 left-3 right-3">
          <div className="bg-black bg-opacity-60 text-white p-3 rounded">
            {video.title && (
              <h4 className="font-medium text-sm mb-1">{video.title}</h4>
            )}
            {video.description && (
              <p className="text-xs text-gray-300 line-clamp-2">{video.description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;