import React, { useCallback, useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { useYellModeStore } from '../../services/yellModeStore';

interface WebcamViewProps {
  onWebcamRef: (ref: HTMLVideoElement | null) => void;
  isFocused: boolean | null;
}

function WebcamView({ onWebcamRef, isFocused }: WebcamViewProps) {
  const webcamRef = useRef<Webcam>(null);
  const { setWebcamActive, updatePermissionStates, isWebcamActive } = useYellModeStore();
  const [isChecking, setIsChecking] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Check webcam permission on mount and activate if permission exists
  useEffect(() => {
    const checkAndActivateWebcam = async () => {
      try {
        setIsChecking(true);
        console.log('Checking webcam permission status on WebcamView mount');
        
        // First check if permission is already granted
        const hasPermission = await useYellModeStore.getState().checkWebcamPermission();
        console.log('Webcam permission check result:', hasPermission);
        
        if (hasPermission) {
          console.log('Webcam permission exists, setting webcam as active');
          setWebcamActive(true);
        }
      } catch (error) {
        console.error('Error checking webcam permission:', error);
      } finally {
        setIsChecking(false);
      }
    };
    
    checkAndActivateWebcam();
  }, [setWebcamActive]);
  
  // Handle webcam reference
  const setRef = useCallback((webcam: Webcam | null) => {
    if (webcam && webcam.video) {
      console.log('Setting webcam video reference');
      
      // Check if video is ready before passing it to parent
      if (webcam.video.readyState >= 2 && 
          webcam.video.videoWidth > 0 && 
          webcam.video.videoHeight > 0) {
        console.log('Webcam video is ready', {
          readyState: webcam.video.readyState,
          width: webcam.video.videoWidth,
          height: webcam.video.videoHeight
        });
        
        // Ensure webcam is marked as active in the store when video is ready
        if (!isWebcamActive) {
          console.log('Video is ready but isWebcamActive is false, updating state');
          setWebcamActive(true);
        }
        
        setIsLoaded(true);
        onWebcamRef(webcam.video);
      } else {
        console.log('Webcam video not fully loaded yet', {
          readyState: webcam.video.readyState,
          width: webcam.video.videoWidth,
          height: webcam.video.videoHeight
        });
        
        // Set up event listener to detect when video is fully loaded
        const videoElement = webcam.video;
        
        const handleVideoReady = () => {
          console.log('Webcam video became ready', {
            readyState: videoElement.readyState,
            width: videoElement.videoWidth,
            height: videoElement.videoHeight
          });
          
          if (videoElement.readyState >= 2 && 
              videoElement.videoWidth > 0 && 
              videoElement.videoHeight > 0) {
            setIsLoaded(true);
            // Ensure webcam is marked as active in the store
            setWebcamActive(true);
            onWebcamRef(videoElement);
            videoElement.removeEventListener('loadeddata', handleVideoReady);
          }
        };
        
        videoElement.addEventListener('loadeddata', handleVideoReady);
        
        // Also try to detect when metadata is loaded
        if (!videoElement.videoWidth || !videoElement.videoHeight) {
          videoElement.addEventListener('loadedmetadata', () => {
            console.log('Webcam metadata loaded', {
              width: videoElement.videoWidth,
              height: videoElement.videoHeight
            });
          });
        }
      }
    } else {
      console.log('Webcam reference cleared or not available');
      setIsLoaded(false);
      onWebcamRef(null);
    }
  }, [onWebcamRef, isWebcamActive, setWebcamActive]);

  // Set webcam active state when webcam is accessed
  const handleUserMedia = useCallback((stream: MediaStream) => {
    console.log('Webcam permission granted and stream active', {
      tracks: stream.getTracks().length,
      videoTracks: stream.getVideoTracks().length
    });
    
    setWebcamActive(true);
    updatePermissionStates({ webcamPermissionGranted: true });
    
    if (webcamRef.current?.video) {
      console.log('Webcam video already available in handleUserMedia');
      // Let the setRef callback handle passing the video element
    }
  }, [setWebcamActive, updatePermissionStates]);

  // Handle permission errors
  const handleUserMediaError = useCallback((error: string | DOMException) => {
    console.error('Webcam error:', error);
    setWebcamActive(false);
    updatePermissionStates({ webcamPermissionGranted: false });
    onWebcamRef(null);
    setIsLoaded(false);
  }, [onWebcamRef, setWebcamActive, updatePermissionStates]);
  
  // Add a debug effect to monitor webcam active state changes
  useEffect(() => {
    console.log('WebcamView: isWebcamActive state changed to', isWebcamActive);
  }, [isWebcamActive]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Focus Detection</h3>
      <div className="relative overflow-hidden rounded-md bg-gray-100 aspect-video">
        {isChecking ? (
          <div className="flex items-center justify-center w-full h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <Webcam
              ref={setRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                width: 640,
                height: 360,
                facingMode: "user"
              }}
              onUserMedia={handleUserMedia}
              onUserMediaError={handleUserMediaError}
              className="w-full h-full object-cover"
              forceScreenshotSourceSize
            />
            
            {!isLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                <div className="animate-pulse text-white text-sm flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Loading webcam...
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Focus status indicator */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-white text-xs
          ${isFocused === null ? 'bg-gray-500' : isFocused ? 'bg-green-500' : 'bg-red-500'}`}>
          {isFocused === null ? 'Analyzing...' : isFocused ? 'Focused' : 'Not Focused'}
        </div>
      </div>
      
      <div className="mt-3 text-sm text-gray-600">
        <p>The webcam is used to detect if you're looking at the screen. Your webcam feed is processed locally and never sent to any server.</p>
      </div>
    </div>
  );
}

export default WebcamView; 