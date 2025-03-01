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
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import { Button } from '../ui/button';

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
      
      // Update productivity state (both content classification and focus detection)
      updateProductivityState({
        isWork,
        isFocused,
        gazeDirection,
        contentConfidence: confidence,
        focusConfidence,
        eyesOpen,
        lastCheckedAt: new Date(),
        detectedWorkItems,
        detectedNonWorkItems
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
  
  // Render YellMode card in dashboard style
  return (
    <Card className="flex flex-col items-center">
      <CardHeader className="text-center">
        <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-4 mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <CardTitle>AI-driven focus enforcement</CardTitle>
        <CardDescription>
          Automatically monitor productivity and stay on track
        </CardDescription>
      </CardHeader>

      <CardContent className="w-full">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {isInitializing && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-sm text-gray-500">Initializing AI models...</span>
          </div>
        )}

        {isActive && (
          <div className="space-y-4">
            {isScreenCaptureActive && screenshot && (
              <ScreenView screenshot={screenshot} />
            )}
            
            {isWebcamActive && (
              <WebcamView 
                onWebcamRef={handleWebcamRef} 
                isFocused={productivityState.isFocused}
                gazeDirection={productivityState.gazeDirection}
                eyesOpen={productivityState.eyesOpen}
              />
            )}
            
            <YellModeControls 
              isActive={isActive} 
              isInitialized={isInitialized}
              onToggle={handleToggleYellMode} 
              lastCheckTime={lastCheckTime}
              productivityState={productivityState}
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="w-full">
        <Button 
          onClick={handleToggleYellMode}
          disabled={isInitializing || (!isInitialized && !isActive)}
          variant="dark"
          className="w-full"
        >
          {isActive ? 'Stop Yell Mode' : 'Activate Yell Mode'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default YellMode; 