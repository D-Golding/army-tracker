// src/utils/videoProcessor.js - Fixed FFmpeg video processing with correct version matching

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

// Video processing configuration
const PROCESSING_CONFIG = {
  // Output settings for social media
  outputFormat: 'mp4',
  videoCodec: 'libx264',
  audioCodec: 'aac',

  // Quality settings (optimized for mobile)
  resolution: '720p', // 1280x720
  videoBitrate: '2000k', // 2 Mbps
  audioBitrate: '128k',

  // Frame rate
  frameRate: 30,

  // Preset for speed vs compression balance
  preset: 'medium'
};

let ffmpeg = null;
let isLoaded = false;

/**
 * Initialize FFmpeg instance with correct version matching
 * @returns {Promise<boolean>} Success status
 */
const initializeFFmpeg = async () => {
  if (isLoaded) return true;

  try {
    console.log('🎬 Initializing FFmpeg...');

    if (!ffmpeg) {
      ffmpeg = new FFmpeg();
    }

    // Use the latest stable version that exists on unpkg
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd';

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    isLoaded = true;
    console.log('✅ FFmpeg loaded successfully');
    return true;

  } catch (error) {
    console.error('❌ FFmpeg initialization failed:', error);
    console.log('🔍 Checking browser compatibility...');

    // Check browser requirements
    if (typeof SharedArrayBuffer === 'undefined') {
      console.error('❌ SharedArrayBuffer not available. Check CORS headers.');
    }

    if (typeof WebAssembly === 'undefined') {
      console.error('❌ WebAssembly not supported in this browser.');
    }

    return false;
  }
};

/**
 * Progress callback for FFmpeg operations
 * @callback ProgressCallback
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} stage - Current processing stage
 */

/**
 * Trim video to specified start and end times
 * @param {File} videoFile - Input video file
 * @param {number} startTime - Start time in seconds
 * @param {number} endTime - End time in seconds
 * @param {ProgressCallback} onProgress - Progress callback
 * @returns {Promise<Blob>} Trimmed video blob
 */
export const trimVideo = async (videoFile, startTime, endTime, onProgress) => {
  try {
    // Initialize FFmpeg
    const initialized = await initializeFFmpeg();
    if (!initialized) {
      throw new Error('Failed to initialize FFmpeg');
    }

    onProgress?.(10, 'Loading video...');

    // Input and output filenames
    const inputName = 'input.mp4';
    const outputName = 'trimmed.mp4';

    // Write input file to FFmpeg filesystem
    await ffmpeg.writeFile(inputName, await fetchFile(videoFile));

    onProgress?.(20, 'Trimming video...');

    // Calculate duration
    const duration = endTime - startTime;

    // FFmpeg command for trimming
    const args = [
      '-i', inputName,
      '-ss', startTime.toString(),
      '-t', duration.toString(),
      '-c', 'copy', // Copy streams without re-encoding (faster)
      '-avoid_negative_ts', 'make_zero',
      outputName
    ];

    // Execute FFmpeg command
    await ffmpeg.exec(args);

    onProgress?.(90, 'Finalizing...');

    // Read the output file
    const outputData = await ffmpeg.readFile(outputName);

    // Clean up
    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);

    onProgress?.(100, 'Complete');

    // Return as blob
    return new Blob([outputData.buffer], { type: 'video/mp4' });

  } catch (error) {
    console.error('Video trimming failed:', error);
    throw new Error(`Trimming failed: ${error.message}`);
  }
};

/**
 * Compress video for social media
 * @param {File|Blob} videoFile - Input video file or blob
 * @param {ProgressCallback} onProgress - Progress callback
 * @returns {Promise<Blob>} Compressed video blob
 */
export const compressVideo = async (videoFile, onProgress) => {
  try {
    // Initialize FFmpeg
    const initialized = await initializeFFmpeg();
    if (!initialized) {
      throw new Error('Failed to initialize FFmpeg');
    }

    onProgress?.(10, 'Loading video...');

    // Input and output filenames
    const inputName = 'input.mp4';
    const outputName = 'compressed.mp4';

    // Write input file to FFmpeg filesystem
    await ffmpeg.writeFile(inputName, await fetchFile(videoFile));

    onProgress?.(20, 'Analyzing video...');

    // FFmpeg command for compression
    const args = [
      '-i', inputName,

      // Video settings
      '-c:v', PROCESSING_CONFIG.videoCodec,
      '-preset', PROCESSING_CONFIG.preset,
      '-crf', '23', // Constant Rate Factor (quality)
      '-b:v', PROCESSING_CONFIG.videoBitrate,
      '-maxrate', '3000k',
      '-bufsize', '6000k',

      // Scale to 720p if larger
      '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2',
      '-r', PROCESSING_CONFIG.frameRate.toString(),

      // Audio settings
      '-c:a', PROCESSING_CONFIG.audioCodec,
      '-b:a', PROCESSING_CONFIG.audioBitrate,
      '-ar', '44100',

      // Output format
      '-f', 'mp4',
      '-movflags', '+faststart', // Optimize for streaming

      outputName
    ];

    onProgress?.(30, 'Compressing video...');

    // Set up progress monitoring
    ffmpeg.on('progress', ({ progress }) => {
      const adjustedProgress = 30 + (progress * 0.6); // Map to 30-90%
      onProgress?.(Math.round(adjustedProgress), 'Compressing video...');
    });

    // Execute FFmpeg command
    await ffmpeg.exec(args);

    onProgress?.(95, 'Finalizing...');

    // Read the output file
    const outputData = await ffmpeg.readFile(outputName);

    // Clean up
    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);

    onProgress?.(100, 'Complete');

    // Return as blob
    return new Blob([outputData.buffer], { type: 'video/mp4' });

  } catch (error) {
    console.error('Video compression failed:', error);
    throw new Error(`Compression failed: ${error.message}`);
  }
};

/**
 * Trim and compress video in one operation
 * @param {File} videoFile - Input video file
 * @param {number} startTime - Start time in seconds
 * @param {number} endTime - End time in seconds
 * @param {ProgressCallback} onProgress - Progress callback
 * @returns {Promise<Blob>} Processed video blob
 */
export const processVideo = async (videoFile, startTime, endTime, onProgress) => {
  try {
    // Initialize FFmpeg
    const initialized = await initializeFFmpeg();
    if (!initialized) {
      throw new Error('Failed to initialize FFmpeg');
    }

    onProgress?.(5, 'Loading video...');

    // Input and output filenames
    const inputName = 'input.mp4';
    const outputName = 'processed.mp4';

    // Write input file to FFmpeg filesystem
    await ffmpeg.writeFile(inputName, await fetchFile(videoFile));

    onProgress?.(15, 'Processing video...');

    // Calculate duration
    const duration = endTime - startTime;

    // Combined FFmpeg command for trim + compress
    const args = [
      '-i', inputName,

      // Trim settings
      '-ss', startTime.toString(),
      '-t', duration.toString(),

      // Video compression settings
      '-c:v', PROCESSING_CONFIG.videoCodec,
      '-preset', PROCESSING_CONFIG.preset,
      '-crf', '23',
      '-b:v', PROCESSING_CONFIG.videoBitrate,
      '-maxrate', '3000k',
      '-bufsize', '6000k',

      // Scale to 720p if larger
      '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2',
      '-r', PROCESSING_CONFIG.frameRate.toString(),

      // Audio settings
      '-c:a', PROCESSING_CONFIG.audioCodec,
      '-b:a', PROCESSING_CONFIG.audioBitrate,
      '-ar', '44100',

      // Output format
      '-f', 'mp4',
      '-movflags', '+faststart',
      '-avoid_negative_ts', 'make_zero',

      outputName
    ];

    // Set up progress monitoring
    ffmpeg.on('progress', ({ progress }) => {
      const adjustedProgress = 15 + (progress * 0.75); // Map to 15-90%
      onProgress?.(Math.round(adjustedProgress), 'Processing video...');
    });

    // Execute FFmpeg command
    await ffmpeg.exec(args);

    onProgress?.(95, 'Finalizing...');

    // Read the output file
    const outputData = await ffmpeg.readFile(outputName);

    // Clean up
    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);

    onProgress?.(100, 'Complete');

    // Return as blob
    return new Blob([outputData.buffer], { type: 'video/mp4' });

  } catch (error) {
    console.error('Video processing failed:', error);
    throw new Error(`Processing failed: ${error.message}`);
  }
};

/**
 * Get video metadata
 * @param {File} videoFile - Video file
 * @returns {Promise<Object>} Video metadata
 */
export const getVideoMetadata = async (videoFile) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(videoFile);

    video.onloadedmetadata = () => {
      const metadata = {
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        aspectRatio: video.videoWidth / video.videoHeight
      };

      URL.revokeObjectURL(url);
      resolve(metadata);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load video metadata'));
    };

    video.src = url;
  });
};

/**
 * Check if FFmpeg is supported in current browser
 * @returns {boolean} Support status
 */
export const isFFmpegSupported = () => {
  return typeof SharedArrayBuffer !== 'undefined' && typeof WebAssembly !== 'undefined';
};

/**
 * Get estimated processing time
 * @param {number} videoDuration - Video duration in seconds
 * @param {number} videoSize - Video file size in bytes
 * @returns {number} Estimated processing time in seconds
 */
export const getEstimatedProcessingTime = (videoDuration, videoSize) => {
  // Rough estimate: processing takes 2-4x video duration depending on size
  const sizeFactor = videoSize / (50 * 1024 * 1024); // Relative to 50MB
  const timeFactor = Math.max(2, Math.min(6, 2 + sizeFactor));
  return Math.round(videoDuration * timeFactor);
};