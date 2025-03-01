/**
 * Service for capturing screenshots for Yell Mode
 */
export const screenshotService = {
  // Reference to active display media stream
  activeStream: null as MediaStream | null,
  
  /**
   * Request access to the user's screen
   * 
   * @returns Promise resolving to true if access granted, false otherwise
   */
  requestScreenAccess: async (): Promise<boolean> => {
    try {
      console.log('Requesting screen capture access...');
      
      // Request screen capture
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'never',
          displaySurface: 'monitor'
        } as MediaTrackConstraints
      });
      
      console.log('Screen capture access granted');
      
      // Store the stream for later use
      screenshotService.activeStream = stream;
      
      // Add event listener for when the user stops sharing
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        console.log('User stopped screen sharing');
        screenshotService.stopCapture();
      });
      
      return true;
    } catch (err) {
      console.error('Error requesting screen access:', err);
      return false;
    }
  },
  
  /**
   * Captures a screenshot of the current screen
   * 
   * @returns Promise resolving to a data URL of the screenshot
   */
  captureScreenshot: async (): Promise<string | null> => {
    try {
      // Check if we have an active stream
      if (!screenshotService.activeStream) {
        console.warn('No active screen capture stream');
        return null;
      }
      
      const track = screenshotService.activeStream.getVideoTracks()[0];
      
      if (!track) {
        console.warn('No video track found in stream');
        return null;
      }
      
      // Create video element for the capture
      const video = document.createElement('video');
      video.srcObject = screenshotService.activeStream;
      
      return new Promise<string | null>((resolve) => {
        // Once the video can play, take a screenshot
        video.onloadedmetadata = () => {
          video.play().then(() => {
            try {
              // Create a canvas element
              const canvas = document.createElement('canvas');
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              
              // Draw the video frame to the canvas
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                console.error('Failed to get canvas context');
                resolve(null);
                return;
              }
              
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              
              // Convert to data URL
              const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
              
              // Clean up
              video.pause();
              video.srcObject = null;
              
              console.log('Screenshot captured successfully');
              resolve(dataUrl);
            } catch (err) {
              console.error('Error capturing screenshot:', err);
              resolve(null);
            }
          }).catch(err => {
            console.error('Error playing video:', err);
            resolve(null);
          });
        };
        
        // Handle errors
        video.onerror = (err) => {
          console.error('Video error:', err);
          resolve(null);
        };
      });
    } catch (err) {
      console.error('Screenshot capture failed:', err);
      return null;
    }
  },
  
  /**
   * Stops any active screen capture
   */
  stopCapture: (): void => {
    if (screenshotService.activeStream) {
      console.log('Stopping screen capture...');
      
      // Stop all tracks in the stream
      screenshotService.activeStream.getTracks().forEach(track => {
        track.stop();
      });
      
      // Clear the reference
      screenshotService.activeStream = null;
    }
  }
}; 