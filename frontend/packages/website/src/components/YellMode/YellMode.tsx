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

// Define a fallback for GazeDirection if it's not properly imported
const GazeDirectionFallback = {
  UNKNOWN: 'unknown',
  CENTER: 'center',
  LEFT: 'left',
  RIGHT: 'right',
  UP: 'up',
  DOWN: 'down'
};

// Use the imported GazeDirection or fallback to our defined version
const GazeDirectionValues = typeof GazeDirection === 'object' ? GazeDirection : GazeDirectionFallback;

/**
 * YellMode component for managing productivity monitoring and feedback
 */
const YellMode: React.FC = () => {
  // State for Yell Mode activation
  const [isActive, setIsActive] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPageVisible, setIsPageVisible] = useState(true);
  
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
   * Handle page visibility changes
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsPageVisible(visible);
      
      console.log(`YellMode detected visibility change: ${visible ? 'visible' : 'hidden'}`);
      
      if (!visible && isActive) {
        // When page becomes hidden while Yell Mode is active
        console.log('Page hidden - continuing to monitor in background');
        
        // Instead of stopping, try to continue in background
        // We'll still reset speech to prevent errors, but won't stop the monitoring
        ttsService.resetSpeech();
        
        // Signal to the system we want to continue processing
        if ('wakeLock' in navigator) {
          try {
            // @ts-ignore - TypeScript may not recognize the experimental Wake Lock API
            navigator.wakeLock.request('screen')
              .then((wakeLock: any) => {
                console.log('Wake Lock obtained - may help with background processing');
                // Release after a timeout to be good citizens
                setTimeout(() => {
                  wakeLock.release();
                  console.log('Wake Lock released');
                }, 30000); // 30 seconds
              })
              .catch((err: any) => console.warn('Wake Lock request failed:', err));
          } catch (err) {
            console.warn('Wake Lock API error:', err);
          }
        }
      } else if (visible && isActive) {
        // When page becomes visible again
        console.log('Page visible again - continuing normal operation');
        
        // Reset speech engine to clear any errors
        ttsService.resetSpeech();
        
        // Run a check to get back in sync
        if (isActive) {
          setTimeout(() => checkProductivity(), 1000);
        }
      }
    };
    
    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Request persistence permission when the component mounts
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'persistent-storage' as any })
        .then(result => {
          if (result.state === 'granted') {
            console.log('Persistent storage permission granted');
          } else {
            console.log('Persistent storage permission status:', result.state);
          }
        })
        .catch(err => console.warn('Permission query error:', err));
    }
    
    // Clean up on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Make sure speech is fully reset on unmount
      ttsService.resetSpeech();
    };
  }, [isActive]);
  
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
    
    // Cleanup on unmount
    return () => {
      ttsService.resetSpeech();
    };
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
          
          // Start the productivity check interval that continues in background
          console.log(`Starting productivity checks every ${checkIntervalMs}ms, including in background`);
          checkIntervalRef.current = window.setInterval(() => {
            // Run even in background, but log different message
            if (document.visibilityState === 'visible') {
              console.log('Running foreground productivity check');
              checkProductivity();
            } else {
              console.log('Running background productivity check');
              checkProductivity(true); // Pass flag indicating running in background
            }
          }, checkIntervalMs);
          
          // Initial check
          if (document.visibilityState === 'visible') {
            checkProductivity();
          }
          
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
        ttsService.resetSpeech();
        
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
      // Always use resetSpeech for cleanup
      ttsService.resetSpeech();
    };
  }, [isActive, settings.useFaceDetection, isInitialized, checkIntervalMs]);
  
  /**
   * Function to check productivity by capturing and analyzing screen content
   * and user focus via webcam if enabled
   * @param isBackgroundCheck Whether this check is running while tab is in background
   */
  const checkProductivity = async (isBackgroundCheck = false) => {
    if (!isActive || !isInitialized) return;
    
    // Log different message but continue processing in background
    if (document.hidden && !isBackgroundCheck) {
      console.log('Page not visible, but continuing with background check');
    }
    
    console.log(`Running productivity check (background: ${isBackgroundCheck})`);
    setLastCheckTime(new Date());
    
    try {
      // Capture screenshot
      const screenshotDataUrl = await screenshotService.captureScreenshot();
      if (!screenshotDataUrl) {
        console.warn('Failed to capture screenshot - may be due to background state');
        return;
      }
      
      // Only update UI if in foreground to avoid unnecessary renders
      if (!isBackgroundCheck) {
        setScreenshot(screenshotDataUrl);
      }
      
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
      let gazeDirection = GazeDirectionValues.UNKNOWN;
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
            gazeDirection = focusResult.gazeDirection || GazeDirectionValues.UNKNOWN;
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
      
      // When determining if we should yell, consider background state
      // but still attempt to yell even in background
      if (shouldYell) {
        // Check cooldown period
        const cooldownMs = parseInt(settings.yellCooldown) * 1000;
        const now = Date.now();
        const timeSinceLastYell = productivityState.lastYellTime 
          ? now - productivityState.lastYellTime.getTime() 
          : cooldownMs + 1; // Ensure first check can trigger a yell
        
        if (timeSinceLastYell > cooldownMs) {
          console.log(`Triggering yell (background: ${isBackgroundCheck})`);
          
          // Generate message based on status
          const message = ttsService.getYellMessage(isWork, isFocused, gazeDirection);
          
          try {
            // Play the message with selected yell style
            ttsService.playYell(message, settings.yellStyle);
            
            // Update last yell time
            updateProductivityState({
              lastYellTime: new Date()
            });
          } catch (error) {
            console.error('Error playing yell:', error);
            // Don't update last yell time if there was an error
          }
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
        <CardTitle>Yell Mode</CardTitle>
        <CardDescription>
          Automatically monitor productivity
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
                isFocused={productivityState.isFocused || false}
                gazeDirection={productivityState.gazeDirection || 'unknown'}
                eyesOpen={productivityState.eyesOpen || true}
              />
            )}
            
            <YellModeControls 
              isActive={isActive} 
              isInitialized={isInitialized}
              onToggle={handleToggleYellMode} 
              lastCheckTime={lastCheckTime}
              productivityState={{
                isWork: productivityState.isWork || false,
                contentConfidence: productivityState.contentConfidence || 0,
                isFocused: productivityState.isFocused || false,
                detectedWorkItems: productivityState.detectedWorkItems || [],
                detectedNonWorkItems: productivityState.detectedNonWorkItems || [],
                gazeDirection: productivityState.gazeDirection || 'unknown',
                eyesOpen: productivityState.eyesOpen || true
              }}
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