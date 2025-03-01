import React, { useEffect, useRef, useState } from 'react';
import { useYellModeStore } from '../../services/yellModeStore';
import { screenshotService } from '../../services/ai/screenshotService';
import { workClassificationService } from '../../services/ai/workClassificationService';
import { focusDetectionService, GazeDirection } from '../../services/ai/focusDetectionService';
import { ttsService } from '../../services/ttsService';
import YellModeControls from './YellModeControls';
import WebcamView from './WebcamView';
import ScreenView from './ScreenView';
import YellSettingsCard from './YellSettingsCard';

/**
 * YellMode component for managing productivity monitoring and feedback
 */
const YellMode: React.FC = () => {
  // State for Yell Mode activation
  const [isActive, setIsActive] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for screen and webcam capture
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
  const webcamRef = useRef<HTMLVideoElement | null>(null);
  
  // Get Yell Mode settings and state from store
  const { 
    settings, 
    productivityState,
    isScreenCaptureActive, 
    isWebcamActive,
    setScreenCaptureActive, 
    setWebcamActive,
    updateProductivityState,
    updatePermissionStates
  } = useYellModeStore();
  
  // Refs for interval IDs
  const checkIntervalRef = useRef<number | null>(null);
  
  // Calculate the check interval in milliseconds
  const checkIntervalMs = parseInt(settings.checkInterval) * 1000;
  
  /**
   * Initialize AI models when component mounts
   */
  useEffect(() => {
    const initializeAI = async () => {
      if (isInitializing) return;
      
      try {
        setIsInitializing(true);
        setError(null);
        
        console.log('Initializing AI models...');
        
        // Initialize focus detection service
        await focusDetectionService.loadModels();
        
        // Initialize image classification service
        await workClassificationService.init();
        
        // Initialize TTS service
        await ttsService.init();
        
        console.log('AI models initialized successfully');
        setIsInitialized(true);
      } catch (err) {
        console.error('Error initializing AI models:', err);
        setError(`Failed to initialize AI: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsInitializing(false);
      }
    };
    
    initializeAI();
  }, []);
  
  /**
   * Effect for handling Yell Mode activation/deactivation
   */
  useEffect(() => {
    const setupYellMode = async () => {
      if (isActive) {
        if (!isInitialized) {
          setError('AI models are not initialized yet. Please wait a moment.');
          return;
        }
        
        try {
          console.log('Setting up Yell Mode...');
          
          // Request screen access
          const hasScreenAccess = await screenshotService.requestScreenAccess();
          if (!hasScreenAccess) {
            setError('Screen capture permission denied. Yell Mode needs screen access to monitor productivity.');
            setIsActive(false);
            return;
          }
          setScreenCaptureActive(true);
          
          // Request webcam access if face detection is enabled
          if (settings.useFaceDetection) {
            try {
              // First check if webcam permission is already granted
              const hasPermission = await useYellModeStore.getState().checkWebcamPermission();
              
              if (hasPermission) {
                console.log('Webcam permission already granted, activating webcam');
                setWebcamActive(true);
              } else {
                // Only request webcam permission if not already granted
                console.log('Requesting webcam permission...');
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                setWebcamActive(true);
                updatePermissionStates({ webcamPermissionGranted: true });
                
                // Clean up the stream to avoid memory leaks
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
              }
            } catch (err) {
              console.warn('Webcam access denied or not available:', err);
              // Don't fail completely, just disable face detection
              setError('Webcam access denied. Face detection will be disabled.');
              setWebcamActive(false);
              updatePermissionStates({ webcamPermissionGranted: false });
            }
          }
          
          // Clear any existing interval
          if (checkIntervalRef.current) {
            window.clearInterval(checkIntervalRef.current);
          }
          
          // Start the productivity check interval
          console.log(`Starting productivity checks every ${checkIntervalMs}ms`);
          checkIntervalRef.current = window.setInterval(() => {
            checkProductivity();
          }, checkIntervalMs);
          
          // Initial check
          checkProductivity();
          
        } catch (err) {
          console.error('Error setting up Yell Mode:', err);
          setError(`Failed to start Yell Mode: ${err instanceof Error ? err.message : 'Unknown error'}`);
          setIsActive(false);
        }
      } else {
        // Clean up when deactivated
        console.log('Cleaning up Yell Mode...');
        
        // Clear interval
        if (checkIntervalRef.current) {
          window.clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
        
        // Release screen capture
        screenshotService.stopCapture();
        setScreenCaptureActive(false);
        
        // Stop any active speech
        ttsService.stopSpeech();
        
        // Reset state
        setScreenshot(null);
        setError(null);
      }
    };
    
    setupYellMode();
    
    // Cleanup on unmount or when isActive changes
    return () => {
      if (checkIntervalRef.current) {
        window.clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [isActive, settings.useFaceDetection, isInitialized]);
  
  /**
   * Function to check productivity by capturing and analyzing screen content
   * and user focus via webcam if enabled
   */
  const checkProductivity = async () => {
    if (!isActive || !isInitialized) return;
    
    console.log('Running productivity check...');
    setLastCheckTime(new Date());
    
    try {
      // Capture screenshot
      const screenshotDataUrl = await screenshotService.captureScreenshot();
      if (!screenshotDataUrl) {
        console.warn('Failed to capture screenshot');
        return;
      }
      
      setScreenshot(screenshotDataUrl);
      
      // Analyze screenshot
      console.log('Classifying screenshot...');
      const classificationResult = await workClassificationService.classifyScreenshot(screenshotDataUrl);
      const { isWork, confidence, detectedWorkItems, detectedNonWorkItems } = classificationResult;
      console.log(`Classification result: isWork=${isWork}, confidence=${confidence}`);
      
      if (detectedWorkItems?.length) {
        console.log('Detected work items:', detectedWorkItems.join(', '));
      }
      
      if (detectedNonWorkItems?.length) {
        console.log('Detected non-work items:', detectedNonWorkItems.join(', '));
      }
      
      // Get the current webcam active state directly from store to ensure we have the latest value
      const currentIsWebcamActive = useYellModeStore.getState().isWebcamActive;
      
      // Analyze user focus if webcam is active
      let isFocused = true; // Default to true if webcam not used
      let focusConfidence = 1;
      let gazeDirection = GazeDirection.UNKNOWN;
      let eyesOpen = true;
      
      // Check for focus detection if enabled
      if (settings.useFaceDetection && currentIsWebcamActive && webcamRef.current) {
        try {
          // Check if webcam video is ready for processing
          const videoElement = webcamRef.current;
          const isVideoReady = videoElement.readyState >= 2 && 
                              videoElement.videoWidth > 0 && 
                              videoElement.videoHeight > 0;
          
          console.log('Running focus detection with webcam:', {
            isWebcamActive: currentIsWebcamActive,
            hasWebcamRef: !!webcamRef.current,
            webcamReadyState: videoElement.readyState,
            isVideoReady
          });
          
          if (!isVideoReady) {
            console.warn('Focus detection: Video element not fully loaded yet, skipping focus detection');
            isFocused = true; // Default to focused when video not ready
            focusConfidence = 0;
          } else {
            const focusResult = await focusDetectionService.detectFocus(webcamRef.current);
            console.log('Focus detection result:', focusResult);
            
            isFocused = focusResult.focused;
            focusConfidence = focusResult.confidence;
            gazeDirection = focusResult.gazeDirection || GazeDirection.UNKNOWN;
            eyesOpen = focusResult.eyesOpen || true;
            
            console.log(`Focus detection: user is ${isFocused ? 'focused' : 'not focused'} (confidence: ${focusConfidence.toFixed(2)})`);
            console.log(`Eye details: gaze direction=${gazeDirection}, eyes open=${eyesOpen}`);
          }
        } catch (error) {
          console.error('Error during focus detection:', error);
          // Default to focused on error
          isFocused = true;
          focusConfidence = 0;
        }
      } else {
        // If face detection is disabled, always consider user focused
        console.log('Focus detection skipped:', {
          useFaceDetection: settings.useFaceDetection,
          isWebcamActive: currentIsWebcamActive,
          hasWebcamRef: !!webcamRef.current
        });
        
        isFocused = true;
        focusConfidence = 1;
      }
      
      // Update productivity state
      updateProductivityState({
        isWork,
        isFocused,
        lastCheckTime: new Date()
      });
      
      // Combine both signals to determine if we should yell
      // We yell if content is non-work OR user is not focused
      const shouldYell = (!isWork || !isFocused);
      
      // Add debug logs for focus detection
      console.log('Yell decision:', {
        shouldYell,
        reasons: {
          nonWorkContent: !isWork,
          notFocused: !isFocused
        },
        contentConfidence: confidence,
        focusConfidence: focusConfidence,
        webcamState: {
          isWebcamActive: currentIsWebcamActive,
          useFaceDetection: settings.useFaceDetection,
          hasWebcamRef: !!webcamRef.current
        }
      });
      
      if (shouldYell) {
        // Check cooldown period
        const cooldownMs = parseInt(settings.yellCooldown) * 1000;
        const now = Date.now();
        const timeSinceLastYell = productivityState.lastYellTime 
          ? now - productivityState.lastYellTime.getTime() 
          : cooldownMs + 1; // Ensure first check can trigger a yell
        
        if (timeSinceLastYell > cooldownMs) {
          console.log('Triggering yell...');
          
          // Generate message based on status
          const message = ttsService.getYellMessage(isWork, isFocused, gazeDirection);
          
          // Play the message with selected yell style
          ttsService.playYell(message, settings.yellStyle);
          
          // Update last yell time
          updateProductivityState({
            lastYellTime: new Date()
          });
        } else {
          console.log(`In cooldown period, ${Math.ceil((cooldownMs - timeSinceLastYell) / 1000)}s remaining`);
        }
      }
    } catch (err) {
      console.error('Error during productivity check:', err);
    }
  };
  
  /**
   * Handle the webcam reference when the WebcamView component loads
   */
  const handleWebcamRef = (videoElement: HTMLVideoElement | null) => {
    console.log('Webcam ref updated:', videoElement ? 'set' : 'null');
    webcamRef.current = videoElement;
  };
  
  /**
   * Handle toggling Yell Mode on/off
   */
  const handleToggleYellMode = () => {
    setIsActive(prevActive => !prevActive);
  };
  
  // Show loading state during initialization
  if (isInitializing) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Yell Mode</h2>
        <div className="flex flex-col items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Initializing AI models...</p>
          <p className="text-gray-500 text-sm mt-2">This may take a moment on first load</p>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <YellModeControls 
        isActive={isActive} 
        onToggle={handleToggleYellMode} 
        error={error}
        isInitialized={isInitialized}
      />
      
      {isActive && (
        <div className="mt-6">
          <div className="mb-4 text-sm text-gray-500">
            <div className="flex items-center mb-1">
              <div className={`w-3 h-3 rounded-full mr-2 ${isScreenCaptureActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Screen Capture: {isScreenCaptureActive ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="flex items-center mb-1">
              <div className={`w-3 h-3 rounded-full mr-2 ${isWebcamActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span>Webcam: {isWebcamActive ? 'Active' : settings.useFaceDetection ? 'Permission Denied' : 'Disabled'}</span>
            </div>
            {lastCheckTime && (
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2 bg-blue-500"></div>
                <span>Last Check: {lastCheckTime.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ScreenView screenshot={screenshot} isWork={productivityState.isWork} />
            
            {settings.useFaceDetection && (
              <WebcamView onWebcamRef={handleWebcamRef} isFocused={productivityState.isFocused} />
            )}
            
            <YellSettingsCard />
          </div>
        </div>
      )}
    </div>
  );
};

export default YellMode; 