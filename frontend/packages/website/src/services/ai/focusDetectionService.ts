import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

// Store models once loaded to avoid reloading
let blazefaceModelPromise: Promise<blazeface.BlazeFaceModel> | null = null;
let faceLandmarksModelPromise: Promise<faceLandmarksDetection.FaceLandmarksDetector> | null = null;
let modelLoadingStarted = false;

// Configuration for focus detection
const CONFIG = {
  // Face detection thresholds
  FACE_PROBABILITY_THRESHOLD: 0.8,
  CENTER_TOLERANCE: 0.25,
  
  // Eye gaze thresholds
  GAZE_STRAIGHT_THRESHOLD: 0.7,
  EYE_OPENNESS_THRESHOLD: 0.6,
  
  // Overall focus confidence threshold
  FOCUS_CONFIDENCE_THRESHOLD: 0.7,
  
  // Weight factors for different focus signals
  WEIGHTS: {
    FACE_DETECTED: 0.3,
    FACE_CENTERED: 0.2,
    FACE_SIZE: 0.15,
    GAZE_DIRECTION: 0.25,
    EYE_OPENNESS: 0.1
  },
  
  // Multi-monitor configuration
  MULTI_MONITOR: {
    ENABLED: true,              // Enable multi-monitor awareness
    VERTICAL_MONITOR: true,     // Set to true if second monitor is above the primary
    UP_TOLERANCE: 0.25,         // Increased tolerance for looking up (was 0.35)
    PERSISTENT_FOCUS_TIME: 3000 // Time in ms to maintain focus when looking at second monitor
  },
  
  // Screen area gaze configuration
  SCREEN_GAZE: {
    // Widened thresholds for considering gaze as within main screen
    HORIZONTAL_RANGE: {
      MIN: 0.25,  // Expanded from 0.35 - less sensitive to looking left
      MAX: 0.75   // Expanded from 0.65 - less sensitive to looking right
    },
    VERTICAL_RANGE: {
      MIN: 0.2,   // Expanded from 0.35 - less sensitive to looking up
      MAX: 0.75   // Expanded from 0.65 - less sensitive to looking down
    },
    // Gradual confidence decay parameters
    CONFIDENCE_DECAY: {
      HORIZONTAL: 0.7, // How quickly confidence drops when looking left/right
      VERTICAL: 0.5    // How quickly confidence drops when looking up/down
    }
  }
};

// Persistent state for multi-monitor tracking
const MONITOR_STATE = {
  lastLookUpTime: 0,
  isLookingAtSecondMonitor: false,
  persistentFocusUntil: 0
};

// Gaze direction enum
export enum GazeDirection {
  STRAIGHT = 'STRAIGHT',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  UP = 'UP',
  DOWN = 'DOWN',
  UNKNOWN = 'UNKNOWN'
}

// More granular screen area classification
export enum ScreenArea {
  CENTER = 'CENTER',
  TOP_LEFT = 'TOP_LEFT',
  TOP = 'TOP',
  TOP_RIGHT = 'TOP_RIGHT',
  RIGHT = 'RIGHT',
  BOTTOM_RIGHT = 'BOTTOM_RIGHT',
  BOTTOM = 'BOTTOM',
  BOTTOM_LEFT = 'BOTTOM_LEFT',
  LEFT = 'LEFT',
  OFF_SCREEN = 'OFF_SCREEN'
}

export interface FocusResult {
  focused: boolean;
  confidence: number;
  faceDetected: boolean;
  gazeDirection?: GazeDirection;
  screenArea?: ScreenArea;      // Added more granular screen position
  eyesOpen?: boolean;
  facePosition?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  center?: {
    x: number;
    y: number;
  };
  isLookingAtSecondMonitor?: boolean; // Added to indicate if user is likely looking at second monitor
}

export interface FocusDetectionState {
  modelLoaded: boolean;
  modelLoading: boolean;
  error: string | null;
}

/**
 * Enhanced service for detecting if a user is focused using face and eye detection
 */
export const focusDetectionService = {
  state: {
    modelLoaded: false,
    modelLoading: false,
    error: null
  } as FocusDetectionState,

  /**
   * Load the required models for focus detection
   */
  loadModels: async (): Promise<void> => {
    if (focusDetectionService.state.modelLoaded || focusDetectionService.state.modelLoading) {
      return;
    }

    try {
      focusDetectionService.state.modelLoading = true;
      
      // Ensure TensorFlow.js is ready
      await tf.ready();
      console.log('Loading face detection and landmark models...');
      
      // Load BlazeFace model for fast initial face detection
      blazefaceModelPromise = blazeface.load({
        maxFaces: 1, // We only need to detect one face (the user)
        modelUrl: undefined, // Use the default model path
        iouThreshold: 0.3,
        scoreThreshold: 0.75
      });
      
      // Load face landmarks model for eye detection
      faceLandmarksModelPromise = faceLandmarksDetection.createDetector(
        faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
        {
          runtime: 'tfjs',
          refineLandmarks: true, // Enable iris landmark detection
          maxFaces: 1
        }
      );
      
      // Wait for both models to load
      await Promise.all([blazefaceModelPromise, faceLandmarksModelPromise]);
      
      focusDetectionService.state.modelLoaded = true;
      console.log('Face detection and landmark models loaded successfully');
    } catch (error) {
      console.error('Error loading focus detection models:', error);
      focusDetectionService.state.error = error instanceof Error ? error.message : 'Unknown error loading focus detection models';
      blazefaceModelPromise = null;
      faceLandmarksModelPromise = null;
    } finally {
      focusDetectionService.state.modelLoading = false;
    }
  },

  /**
   * Get the BlazeFace model, loading it if necessary
   */
  getBlazeFaceModel: async (): Promise<blazeface.BlazeFaceModel> => {
    if (!blazefaceModelPromise) {
      await focusDetectionService.loadModels();
      if (!blazefaceModelPromise) {
        throw new Error('Failed to load BlazeFace model');
      }
    }
    return blazefaceModelPromise;
  },

  /**
   * Get the Face Landmarks model, loading it if necessary
   */
  getFaceLandmarksModel: async (): Promise<faceLandmarksDetection.FaceLandmarksDetector> => {
    if (!faceLandmarksModelPromise) {
      await focusDetectionService.loadModels();
      if (!faceLandmarksModelPromise) {
        throw new Error('Failed to load Face Landmarks model');
      }
    }
    return faceLandmarksModelPromise;
  },

  /**
   * Determine eye gaze direction based on facial landmarks
   * @param landmarks The facial landmarks detected by MediaPipe Face Mesh
   * @param imageWidth Width of the input image
   * @param imageHeight Height of the input image
   * @returns The detected gaze direction
   */
  determineGazeDirection: (
    landmarks: faceLandmarksDetection.Keypoint[],
    imageWidth: number,
    imageHeight: number
  ): { 
    direction: GazeDirection; 
    screenArea: ScreenArea; 
    horizontalRatio: number; 
    verticalRatio: number; 
    gazeConfidence: number; 
  } => {
    try {
      // Get eye landmark indices
      // Left eye landmarks (from user's perspective)
      const leftEyeIndices = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7];
      // Right eye landmarks (from user's perspective)
      const rightEyeIndices = [263, 249, 390, 373, 374, 380, 381, 382, 362, 466, 388, 387, 386, 385, 384, 398];
      // Iris landmarks
      const leftIrisIndices = [468, 469, 470, 471, 472];
      const rightIrisIndices = [473, 474, 475, 476, 477];

      // Extract eye and iris landmarks
      const leftEyePoints = leftEyeIndices.map(index => landmarks[index]);
      const rightEyePoints = rightEyeIndices.map(index => landmarks[index]);
      const leftIrisPoints = leftIrisIndices.map(index => landmarks[index]);
      const rightIrisPoints = rightIrisIndices.map(index => landmarks[index]);
      
      // Calculate eye centers
      const leftEyeCenter = {
        x: leftEyePoints.reduce((sum, point) => sum + point.x, 0) / leftEyePoints.length,
        y: leftEyePoints.reduce((sum, point) => sum + point.y, 0) / leftEyePoints.length
      };
      
      const rightEyeCenter = {
        x: rightEyePoints.reduce((sum, point) => sum + point.x, 0) / rightEyePoints.length,
        y: rightEyePoints.reduce((sum, point) => sum + point.y, 0) / rightEyePoints.length
      };
      
      // Calculate iris centers
      const leftIrisCenter = {
        x: leftIrisPoints.reduce((sum, point) => sum + point.x, 0) / leftIrisPoints.length,
        y: leftIrisPoints.reduce((sum, point) => sum + point.y, 0) / leftIrisPoints.length
      };
      
      const rightIrisCenter = {
        x: rightIrisPoints.reduce((sum, point) => sum + point.x, 0) / rightIrisPoints.length,
        y: rightIrisPoints.reduce((sum, point) => sum + point.y, 0) / rightIrisPoints.length
      };
      
      // Calculate the horizontal ratio for both eyes
      // This measures how far to the left or right the iris is within the eye
      const leftEyeWidth = Math.max(...leftEyePoints.map(p => p.x)) - Math.min(...leftEyePoints.map(p => p.x));
      const rightEyeWidth = Math.max(...rightEyePoints.map(p => p.x)) - Math.min(...rightEyePoints.map(p => p.x));
      
      const leftHorizRatio = (leftIrisCenter.x - (leftEyeCenter.x - leftEyeWidth/2)) / leftEyeWidth;
      const rightHorizRatio = (rightIrisCenter.x - (rightEyeCenter.x - rightEyeWidth/2)) / rightEyeWidth;
      
      // Calculate the vertical ratio for both eyes
      // This measures how far up or down the iris is within the eye
      const leftEyeHeight = Math.max(...leftEyePoints.map(p => p.y)) - Math.min(...leftEyePoints.map(p => p.y));
      const rightEyeHeight = Math.max(...rightEyePoints.map(p => p.y)) - Math.min(...rightEyePoints.map(p => p.y));
      
      const leftVertRatio = (leftIrisCenter.y - (leftEyeCenter.y - leftEyeHeight/2)) / leftEyeHeight;
      const rightVertRatio = (rightIrisCenter.y - (rightEyeCenter.y - rightEyeHeight/2)) / rightEyeHeight;
      
      // Average the ratios from both eyes
      const horizRatio = (leftHorizRatio + rightHorizRatio) / 2;
      const vertRatio = (leftVertRatio + rightVertRatio) / 2;
      
      // Calculate and log more detailed information about eye position
      const detailedEyeInfo = {
        leftEye: { 
          horizontalRatio: leftHorizRatio.toFixed(2), 
          verticalRatio: leftVertRatio.toFixed(2) 
        },
        rightEye: { 
          horizontalRatio: rightHorizRatio.toFixed(2), 
          verticalRatio: rightVertRatio.toFixed(2) 
        },
        average: { 
          horizontalRatio: horizRatio.toFixed(2), 
          verticalRatio: vertRatio.toFixed(2) 
        }
      };
      
      // Log detailed information about eye position occasionally
      if (Math.random() < 0.05) { // Log only 5% of the time to reduce console spam
        console.log('Detailed eye position:', detailedEyeInfo);
      }
      
      // Determine gaze direction with modified UP threshold for multi-monitor setups
      const upThreshold = CONFIG.MULTI_MONITOR.ENABLED && CONFIG.MULTI_MONITOR.VERTICAL_MONITOR 
        ? CONFIG.MULTI_MONITOR.UP_TOLERANCE  // Use higher tolerance (0.25 instead of 0.35)
        : CONFIG.SCREEN_GAZE.VERTICAL_RANGE.MIN;  // Use the screen gaze vertical range
      
      // Determine basic gaze direction
      let direction: GazeDirection;
      if (horizRatio < CONFIG.SCREEN_GAZE.HORIZONTAL_RANGE.MIN) {
        direction = GazeDirection.LEFT;
      } else if (horizRatio > CONFIG.SCREEN_GAZE.HORIZONTAL_RANGE.MAX) {
        direction = GazeDirection.RIGHT;
      } else if (vertRatio < upThreshold) {
        // If looking up, track this for multi-monitor awareness
        if (CONFIG.MULTI_MONITOR.ENABLED && CONFIG.MULTI_MONITOR.VERTICAL_MONITOR) {
          MONITOR_STATE.lastLookUpTime = Date.now();
          MONITOR_STATE.isLookingAtSecondMonitor = true;
          
          // Set persistent focus time
          MONITOR_STATE.persistentFocusUntil = Date.now() + CONFIG.MULTI_MONITOR.PERSISTENT_FOCUS_TIME;
        }
        direction = GazeDirection.UP;
      } else if (vertRatio > CONFIG.SCREEN_GAZE.VERTICAL_RANGE.MAX) {
        direction = GazeDirection.DOWN;
      } else {
        direction = GazeDirection.STRAIGHT;
      }
      
      // Determine more granular screen area
      let screenArea: ScreenArea;
      
      // Check if gaze is within main screen bounds
      const withinHorizontalBounds = 
        horizRatio >= CONFIG.SCREEN_GAZE.HORIZONTAL_RANGE.MIN && 
        horizRatio <= CONFIG.SCREEN_GAZE.HORIZONTAL_RANGE.MAX;
        
      const withinVerticalBounds = 
        vertRatio >= CONFIG.SCREEN_GAZE.VERTICAL_RANGE.MIN && 
        vertRatio <= CONFIG.SCREEN_GAZE.VERTICAL_RANGE.MAX;
      
      if (!withinHorizontalBounds || !withinVerticalBounds) {
        screenArea = ScreenArea.OFF_SCREEN;
      } else if (horizRatio < 0.4 && vertRatio < 0.4) {
        screenArea = ScreenArea.TOP_LEFT;
      } else if (horizRatio >= 0.4 && horizRatio <= 0.6 && vertRatio < 0.4) {
        screenArea = ScreenArea.TOP;
      } else if (horizRatio > 0.6 && vertRatio < 0.4) {
        screenArea = ScreenArea.TOP_RIGHT;
      } else if (horizRatio > 0.6 && vertRatio >= 0.4 && vertRatio <= 0.6) {
        screenArea = ScreenArea.RIGHT;
      } else if (horizRatio > 0.6 && vertRatio > 0.6) {
        screenArea = ScreenArea.BOTTOM_RIGHT;
      } else if (horizRatio >= 0.4 && horizRatio <= 0.6 && vertRatio > 0.6) {
        screenArea = ScreenArea.BOTTOM;
      } else if (horizRatio < 0.4 && vertRatio > 0.6) {
        screenArea = ScreenArea.BOTTOM_LEFT;
      } else if (horizRatio < 0.4 && vertRatio >= 0.4 && vertRatio <= 0.6) {
        screenArea = ScreenArea.LEFT;
      } else {
        screenArea = ScreenArea.CENTER;
      }
      
      // Calculate a continuous gaze confidence score based on distance from center
      // This provides a smoother transition from focused to unfocused
      
      // Calculate distance from ideal center position (0.5, 0.5)
      const horizontalDistanceFromCenter = Math.abs(horizRatio - 0.5);
      const verticalDistanceFromCenter = Math.abs(vertRatio - 0.5);
      
      // Calculate confidence decay based on distance (1.0 at center, decaying outward)
      const horizontalConfidence = Math.max(0, 1 - (horizontalDistanceFromCenter * 2 * CONFIG.SCREEN_GAZE.CONFIDENCE_DECAY.HORIZONTAL));
      const verticalConfidence = Math.max(0, 1 - (verticalDistanceFromCenter * 2 * CONFIG.SCREEN_GAZE.CONFIDENCE_DECAY.VERTICAL));
      
      // Combine for overall gaze confidence
      let gazeConfidence = horizontalConfidence * verticalConfidence;
      
      // If looking at second monitor, boost confidence
      if (CONFIG.MULTI_MONITOR.ENABLED && 
          CONFIG.MULTI_MONITOR.VERTICAL_MONITOR && 
          direction === GazeDirection.UP) {
        gazeConfidence = 0.85; // High confidence for second monitor
      }
      
      // Occasional logging of gaze calculations
      if (Math.random() < 0.02) {
        console.log(`Gaze confidence calculation: horizontal=${horizontalConfidence.toFixed(2)}, vertical=${verticalConfidence.toFixed(2)}, combined=${gazeConfidence.toFixed(2)}, area=${screenArea}`);
      }
      
      return { 
        direction, 
        screenArea, 
        horizontalRatio: horizRatio, 
        verticalRatio: vertRatio, 
        gazeConfidence 
      };
    } catch (error) {
      console.error('Error determining gaze direction:', error);
      return { 
        direction: GazeDirection.UNKNOWN, 
        screenArea: ScreenArea.OFF_SCREEN, 
        horizontalRatio: 0.5, 
        verticalRatio: 0.5, 
        gazeConfidence: 0.5 
      };
    }
  },

  /**
   * Detect if eyes are open based on facial landmarks
   * @param landmarks The facial landmarks detected by MediaPipe Face Mesh
   * @returns Boolean indicating if eyes are open
   */
  detectEyeOpenness: (landmarks: faceLandmarksDetection.Keypoint[]): boolean => {
    try {
      // Key landmarks for eye openness detection
      // Top and bottom of left eye
      const leftEyeTop = landmarks[159];
      const leftEyeBottom = landmarks[145];
      
      // Top and bottom of right eye
      const rightEyeTop = landmarks[386];
      const rightEyeBottom = landmarks[374];
      
      // Calculate vertical distance for both eyes
      const leftEyeDistance = Math.sqrt(
        Math.pow(leftEyeTop.x - leftEyeBottom.x, 2) + 
        Math.pow(leftEyeTop.y - leftEyeBottom.y, 2)
      );
      
      const rightEyeDistance = Math.sqrt(
        Math.pow(rightEyeTop.x - rightEyeBottom.x, 2) + 
        Math.pow(rightEyeTop.y - rightEyeBottom.y, 2)
      );
      
      // Calculate horizontal distance for scale normalization
      const leftEyeWidth = Math.sqrt(
        Math.pow(landmarks[133].x - landmarks[33].x, 2) + 
        Math.pow(landmarks[133].y - landmarks[33].y, 2)
      );
      
      const rightEyeWidth = Math.sqrt(
        Math.pow(landmarks[362].x - landmarks[263].x, 2) + 
        Math.pow(landmarks[362].y - landmarks[263].y, 2)
      );
      
      // Calculate openness ratio for both eyes
      const leftOpenRatio = leftEyeDistance / leftEyeWidth;
      const rightOpenRatio = rightEyeDistance / rightEyeWidth;
      
      // Average the ratios
      const openRatio = (leftOpenRatio + rightOpenRatio) / 2;
      
      // Determine if eyes are open based on threshold
      return openRatio > CONFIG.EYE_OPENNESS_THRESHOLD;
    } catch (error) {
      console.error('Error detecting eye openness:', error);
      return true; // Default to eyes open on error
    }
  },

  /**
   * Check if the user is likely looking at a second monitor
   * @param gazeDirection The current gaze direction
   * @returns Boolean indicating if the user is likely looking at a second monitor
   */
  isLookingAtSecondMonitor: (gazeDirection: GazeDirection): boolean => {
    // If multi-monitor mode is disabled, always return false
    if (!CONFIG.MULTI_MONITOR.ENABLED) {
      return false;
    }
    
    const now = Date.now();
    
    // If we've recently determined the user is looking at a second monitor,
    // extend that determination for a grace period to prevent flickering
    if (now < MONITOR_STATE.persistentFocusUntil) {
      return true;
    }
    
    // Check if the user is looking up (for vertical monitor setup)
    if (CONFIG.MULTI_MONITOR.VERTICAL_MONITOR && gazeDirection === GazeDirection.UP) {
      return true;
    }
    
    // Reset the second monitor state if no longer looking at it
    MONITOR_STATE.isLookingAtSecondMonitor = false;
    
    return false;
  },

  /**
   * Detect if the user is focused on the screen
   * Combines face detection, eye gaze direction, and eye openness
   * @param videoElement The webcam video element to analyze
   */
  detectFocus: async (videoElement: HTMLVideoElement): Promise<FocusResult> => {
    try {
      // Ensure video is ready
      if (
        videoElement.readyState < 2 ||
        videoElement.paused ||
        videoElement.videoWidth === 0 ||
        videoElement.videoHeight === 0
      ) {
        return {
          focused: false,
          confidence: 0,
          faceDetected: false
        };
      }

      // Get video dimensions
      const videoWidth = videoElement.videoWidth;
      const videoHeight = videoElement.videoHeight;
      
      // First use BlazeFace for fast initial face detection
      const blazefaceModel = await focusDetectionService.getBlazeFaceModel();
      const predictions = await blazefaceModel.estimateFaces(videoElement, false);
      
      // If no faces detected, user is not focused
      if (!predictions || predictions.length === 0) {
        return {
          focused: false,
          confidence: 0,
          faceDetected: false
        };
      }

      // Get the first (and usually only) face detected
      const face = predictions[0];
      
      // Calculate face position and dimensions for focus metrics
      const faceBox = {
        x: face.topLeft[0],
        y: face.topLeft[1],
        width: face.bottomRight[0] - face.topLeft[0],
        height: face.bottomRight[1] - face.topLeft[1]
      };
      
      // Calculate face center point
      const faceCenter = {
        x: faceBox.x + faceBox.width / 2,
        y: faceBox.y + faceBox.height / 2
      };
      
      // Calculate normalized position (0-1 range)
      const normalizedCenter = {
        x: faceCenter.x / videoWidth,
        y: faceCenter.y / videoHeight
      };
      
      // Calculate how centered the face is (0-1, where 1 is perfectly centered)
      const centeredness = 1 - 
        Math.min(
          Math.abs(normalizedCenter.x - 0.5) * 2, 
          CONFIG.CENTER_TOLERANCE * 2
        ) / (CONFIG.CENTER_TOLERANCE * 2);
      
      // Calculate face size relative to frame (0-1)
      const relativeSize = Math.min(
        (faceBox.width * faceBox.height) / (videoWidth * videoHeight) * 10, 
        1
      );
      
      // Get probability from face detection
      const probability = face.probability ? face.probability[0] : 0.5;

      // Now use face landmarks model for eye detection
      let gazeDirection = GazeDirection.UNKNOWN;
      let screenArea = ScreenArea.OFF_SCREEN;
      let eyesOpen = true;
      let gazeConfidence = 0.5; // Default middle value
      
      try {
        const landmarksModel = await focusDetectionService.getFaceLandmarksModel();
        const faceLandmarks = await landmarksModel.estimateFaces(videoElement);
        
        if (faceLandmarks && faceLandmarks.length > 0) {
          const landmarks = faceLandmarks[0].keypoints;
          
          // Use enhanced gaze direction detection
          const gazeResults = focusDetectionService.determineGazeDirection(
            landmarks, videoWidth, videoHeight
          );
          
          gazeDirection = gazeResults.direction;
          screenArea = gazeResults.screenArea;
          gazeConfidence = gazeResults.gazeConfidence;
          
          // Detect if eyes are open
          eyesOpen = focusDetectionService.detectEyeOpenness(landmarks);
          
          console.log(`Eye detection: gaze=${gazeDirection}, area=${screenArea}, confidence=${gazeConfidence.toFixed(2)}, eyesOpen=${eyesOpen}`);
        }
      } catch (error) {
        console.error('Error during face landmarks detection:', error);
        // Use default values on error
        gazeDirection = GazeDirection.STRAIGHT;
        screenArea = ScreenArea.CENTER;
        eyesOpen = true;
      }
      
      // Check if looking at second monitor
      const isLookingAtSecondMonitor = focusDetectionService.isLookingAtSecondMonitor(gazeDirection);
      
      // Calculate focus confidence based on combined signals
      let focusConfidence = 
        (probability > CONFIG.FACE_PROBABILITY_THRESHOLD ? 1 : probability / CONFIG.FACE_PROBABILITY_THRESHOLD) * CONFIG.WEIGHTS.FACE_DETECTED +
        centeredness * CONFIG.WEIGHTS.FACE_CENTERED +
        relativeSize * CONFIG.WEIGHTS.FACE_SIZE +
        gazeConfidence * CONFIG.WEIGHTS.GAZE_DIRECTION +
        (eyesOpen ? 1 : 0) * CONFIG.WEIGHTS.EYE_OPENNESS;
      
      // Boost focus score if user is looking at a second monitor
      if (isLookingAtSecondMonitor) {
        // Apply a small boost to ensure focus is maintained while looking at second monitor
        focusConfidence = Math.min(focusConfidence * 1.15, 1.0);
      }
      
      // If eyes are within the main screen bounds, apply a minimum confidence floor
      // This ensures we don't consider users unfocused when they're just looking at different
      // parts of the same screen
      if (screenArea !== ScreenArea.OFF_SCREEN && eyesOpen) {
        focusConfidence = Math.max(focusConfidence, 0.75);
      }
      
      // Determine if user is focused based on confidence threshold
      const isFocused = focusConfidence > CONFIG.FOCUS_CONFIDENCE_THRESHOLD;
      
      return {
        focused: isFocused,
        confidence: focusConfidence,
        faceDetected: true,
        gazeDirection,
        screenArea,
        eyesOpen,
        facePosition: faceBox,
        center: faceCenter,
        isLookingAtSecondMonitor
      };
    } catch (error) {
      console.error('Error during focus detection:', error);
      return {
        focused: false,
        confidence: 0,
        faceDetected: false
      };
    }
  }
};

export default focusDetectionService; 