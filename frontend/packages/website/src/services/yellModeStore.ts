import { create } from 'zustand';
import { YellStyle } from './ttsService';

// Interface for Yell Mode settings
export interface YellModeSettings {
  // How often to check productivity (in seconds)
  checkInterval: string;
  
  // Style of voice/tone to use for yells
  yellStyle: YellStyle;
  
  // Cooldown between yells (in seconds)
  yellCooldown: string;
  
  // Whether to use face detection for focus
  useFaceDetection: boolean;
}

// Interface for productivity state
export interface ProductivityState {
  // Whether the screen content is work-related
  isWork: boolean;
  
  // Whether the user is focused on the screen (based on face detection)
  isFocused: boolean;
  
  // The last time a productivity check was performed
  lastCheckTime: Date | null;
  
  // The last time a yell was played
  lastYellTime: Date | null;
}

// Interface for permission states
export interface PermissionStates {
  // Whether webcam permission has been granted
  webcamPermissionGranted: boolean | null;
  
  // Whether screen capture permission has been granted
  screenPermissionGranted: boolean | null;
}

// Interface for the full Yell Mode state
export interface YellModeState {
  // Yell Mode settings
  settings: YellModeSettings;
  
  // Current productivity state
  productivityState: ProductivityState;
  
 // Whether screen capture is active
  isScreenCaptureActive: boolean;
  
  // Whether webcam is active
  isWebcamActive: boolean;
  
  // Permission states
  permissionStates: PermissionStates;
  
  // Setting functions
  setScreenCaptureActive: (active: boolean) => void;
  setWebcamActive: (active: boolean) => void;
  updateSettings: (settings: Partial<YellModeSettings>) => void;
  updateProductivityState: (state: Partial<ProductivityState>) => void;
  updatePermissionStates: (state: Partial<PermissionStates>) => void;
  checkWebcamPermission: () => Promise<boolean>;
  resetState: () => void;
}

// Default settings
const DEFAULT_SETTINGS: YellModeSettings = {
  checkInterval: '10', // 10 seconds
  yellStyle: 'coach', // Supportive coach voice
  yellCooldown: '30', // 30 seconds
  useFaceDetection: true, // Enable face detection by default
};

// Default productivity state
const DEFAULT_PRODUCTIVITY_STATE: ProductivityState = {
  isWork: true, // Assume work by default
  isFocused: true, // Assume focused by default
  lastCheckTime: null,
  lastYellTime: null,
};

// Default permission states
const DEFAULT_PERMISSION_STATES: PermissionStates = {
  webcamPermissionGranted: null, // Not checked yet
  screenPermissionGranted: null, // Not checked yet
};

/**
 * Checks if webcam permission is already granted without prompting
 * @returns Promise resolving to boolean indicating if permission is granted
 */
async function checkExistingWebcamPermission(): Promise<boolean> {
  try {
    // Check for existing permissions without requesting new ones
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    
    // If no video devices found, permissions can't be granted
    if (videoDevices.length === 0) return false;
    
    // Check if we have detailed device info (indicates permission granted)
    // When permission is not granted, device.label will be empty
    return videoDevices.some(device => device.label !== '');
  } catch (error) {
    console.error('Error checking webcam permission:', error);
    return false;
  }
}

/**
 * Zustand store for Yell Mode
 */
export const useYellModeStore = create<YellModeState>((set, get) => ({
  // Settings with defaults
  settings: DEFAULT_SETTINGS,
  
  // Initial productivity state
  productivityState: DEFAULT_PRODUCTIVITY_STATE,
  
  // Permission and activity states
  isScreenCaptureActive: false,
  isWebcamActive: false,
  permissionStates: DEFAULT_PERMISSION_STATES,
  
  /**
   * Set whether screen capture is active
   */
  setScreenCaptureActive: (active: boolean) => 
    set(state => ({ 
      isScreenCaptureActive: active,
      permissionStates: {
        ...state.permissionStates,
        screenPermissionGranted: active ? true : state.permissionStates.screenPermissionGranted
      }
    })),
  
  /**
   * Set whether webcam is active
   */
  setWebcamActive: (active: boolean) => 
    set(state => ({ 
      isWebcamActive: active,
      permissionStates: {
        ...state.permissionStates,
        webcamPermissionGranted: active ? true : state.permissionStates.webcamPermissionGranted
      }
    })),
  
  /**
   * Update Yell Mode settings
   */
  updateSettings: (newSettings: Partial<YellModeSettings>) => 
    set(state => ({
      settings: { ...state.settings, ...newSettings },
    })),
  
  /**
   * Update productivity state
   */
  updateProductivityState: (newState: Partial<ProductivityState>) => 
    set(state => ({
      productivityState: { ...state.productivityState, ...newState },
    })),
  
  /**
   * Update permission states
   */
  updatePermissionStates: (newState: Partial<PermissionStates>) => 
    set(state => ({
      permissionStates: { ...state.permissionStates, ...newState },
    })),
  
  /**
   * Check if webcam permission is already granted
   * @returns Promise resolving to boolean indicating if permission is granted
   */
  checkWebcamPermission: async () => {
    const state = get();
    
    // If we already know permission is granted, return true
    if (state.permissionStates.webcamPermissionGranted === true) {
      console.log('Webcam permission already known to be granted');
      return true;
    }
    
    // Check for existing webcam permission
    const hasPermission = await checkExistingWebcamPermission();
    console.log('Existing webcam permission check result:', hasPermission);
    
    // Update state with result
    set(state => ({
      permissionStates: {
        ...state.permissionStates,
        webcamPermissionGranted: hasPermission
      },
      // Also update the webcam active state if permission is granted
      isWebcamActive: hasPermission ? true : state.isWebcamActive
    }));
    
    return hasPermission;
  },
  
  /**
   * Reset all state to defaults
   */
  resetState: () => 
    set({
      settings: DEFAULT_SETTINGS,
      productivityState: DEFAULT_PRODUCTIVITY_STATE,
      isScreenCaptureActive: false,
      isWebcamActive: false,
      permissionStates: DEFAULT_PERMISSION_STATES,
    }),
})); 