// utils/videoThumbnailGenerator.js - Generate thumbnails from video files
export const generateVideoThumbnail = (file, seekTime = 1) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    video.addEventListener('loadedmetadata', () => {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Seek to the specified time (default 1 second)
      video.currentTime = Math.min(seekTime, video.duration * 0.1);
    });

    video.addEventListener('seeked', () => {
      try {
        // Draw the video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            const thumbnailUrl = URL.createObjectURL(blob);
            resolve(thumbnailUrl);
          } else {
            reject(new Error('Failed to generate thumbnail'));
          }
        }, 'image/jpeg', 0.8);
      } catch (error) {
        reject(error);
      }
    });

    video.addEventListener('error', (error) => {
      reject(error);
    });

    // Load the video
    video.preload = 'metadata';
    video.muted = true;
    video.src = URL.createObjectURL(file);
  });
};

export const generateVideoThumbnailFromUrl = (videoUrl, seekTime = 1) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    video.crossOrigin = 'anonymous';

    video.addEventListener('loadedmetadata', () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      video.currentTime = Math.min(seekTime, video.duration * 0.1);
    });

    video.addEventListener('seeked', () => {
      try {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const thumbnailUrl = URL.createObjectURL(blob);
            resolve(thumbnailUrl);
          } else {
            reject(new Error('Failed to generate thumbnail'));
          }
        }, 'image/jpeg', 0.8);
      } catch (error) {
        reject(error);
      }
    });

    video.addEventListener('error', (error) => {
      reject(error);
    });

    video.preload = 'metadata';
    video.muted = true;
    video.src = videoUrl;
  });
};