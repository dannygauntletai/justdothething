// Available voices for the yells
export type YellStyle = 'coach' | 'drill_sergeant' | 'friendly' | 'motivational';

// Track visibility and utterance state
let isPageVisible = true;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let shouldPreventInterruptErrors = false;
// Audio context for maintaining background audio capability
let audioContext: AudioContext | null = null;
let backgroundAudioNode: AudioBufferSourceNode | null = null;
let backgroundPermissionsRequested = false;
let isSpeaking = false;

// Add visibility change detection
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    const wasHidden = !isPageVisible;
    isPageVisible = !document.hidden;
    
    console.log(`Page visibility changed: ${isPageVisible ? 'visible' : 'hidden'}`);
    
    // If page is becoming hidden, mark that we should ignore interrupt errors
    if (!isPageVisible) {
      shouldPreventInterruptErrors = true;
      // Request audio focus when page becomes hidden (this may help in some browsers)
      ttsService.requestBackgroundPermissions();
    }
    
    // If page just became visible (was hidden before)
    if (isPageVisible && wasHidden) {
      console.log('Page became visible, handling speech transition');
      // Use a more gentle approach than completely resetting speech
      if (window.speechSynthesis && window.speechSynthesis.paused) {
        try {
          window.speechSynthesis.resume();
        } catch (e) {
          // If resume fails, then reset
          ttsService.resetSpeech();
        }
      }
      
      // Keep the flag true for a short time to catch any delayed errors
      setTimeout(() => {
        shouldPreventInterruptErrors = false;
      }, 1000);
    }
  });
}

// Messages to use for yells
const YELL_MESSAGES: Record<string, string[]> = {
  not_working: [
    "Hey! What the hell are you doing? Get your ass back to work!",
    "Are those fucking cat videos helping you finish your goddamn work?",
    "That shit doesn't look like work to me!",
    "Get your ass back on track - your future self will thank you.",
    "Focus, dammit! You've got important shit to accomplish today."
  ],
  not_focused: [
    "I can't see you looking at the fucking screen. Stay engaged!",
    "Your eyes should be on the damn screen, not elsewhere!",
    "Are you still there? I don't see you focused on your work, asshole.",
    "Keep your shit together. Eyes on the damn screen!",
    "Where the fuck did you go? Let's get back to work!"
  ],
  both_issues: [
    "Double fucking trouble! You're not focused AND not on work content.",
    "I need you present and working, goddammit! Let's get back to it.",
    "Both your attention and your screen need to get back to fucking business.",
    "Full reset needed - eyes on screen, work application open, you lazy shit!",
    "You're completely off task right now. Fix that shit!"
  ]
};

// Cache for available voices
let availableVoices: SpeechSynthesisVoice[] = [];

/**
 * Service for generating text-to-speech yells
 */
export const ttsService = {
  /**
   * Initialize the speech synthesis and get available voices
   */
  init: (): boolean => {
    console.log('Initializing TTS service...');
    
    try {
      // Initialize Audio Context for background audio capabilities
      if (!audioContext && typeof AudioContext !== 'undefined') {
        audioContext = new AudioContext();
        console.log('Audio Context initialized');
      }
      
      // Set up visibility change handler
      document.addEventListener('visibilitychange', () => {
        const isVisible = !document.hidden;
        isPageVisible = isVisible;
        
        if (!isVisible) {
          console.log('TTS Service: Page hidden, requesting background permissions');
          ttsService.requestBackgroundPermissions();
        } else {
          console.log('TTS Service: Page visible');
          // Reset the shouldPreventInterruptErrors flag when page becomes visible
          shouldPreventInterruptErrors = true;
          setTimeout(() => {
            shouldPreventInterruptErrors = false;
          }, 1000);
        }
      });
      
      // Request notification permissions for background alerts
      if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        console.log('Requesting notification permission for background alerts');
        Notification.requestPermission()
          .then(permission => {
            console.log(`Notification permission ${permission}`);
          })
          .catch(err => console.warn('Error requesting notification permission:', err));
      }
      
      // Run initial audio context check
      ttsService.requestBackgroundPermissions();
      
      return true;
    } catch (error) {
      console.error('Error initializing TTS service:', error);
      return false;
    }
  },

  /**
   * Request permissions needed for background operation
   * This may not work in all browsers due to security restrictions
   */
  requestBackgroundPermissions: async (): Promise<void> => {
    if (backgroundPermissionsRequested) return;
    
    try {
      // Request persistent storage permission
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'persistent-storage' as any })
          .then(result => {
            console.log('Persistent storage permission status:', result.state);
          })
          .catch(err => console.warn('Permission query error:', err));
      }
      
      // Try to resume audio context if suspended
      if (audioContext && audioContext.state === 'suspended') {
        await audioContext.resume();
        console.log('AudioContext resumed');
      }
      
      // Play a silent sound to keep audio context active
      ttsService.playSilentSound();
      
      backgroundPermissionsRequested = true;
    } catch (error) {
      console.warn('Error requesting background permissions:', error);
    }
  },

  /**
   * Plays a silent sound to keep audio context active
   */
  playSilentSound: () => {
    try {
      if (!audioContext) return;
      
      // Create silent buffer (1 second)
      const buffer = audioContext.createBuffer(1, audioContext.sampleRate, audioContext.sampleRate);
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start();
      console.log('Playing silent sound to keep audio context active');
    } catch (error) {
      console.warn('Error playing silent sound:', error);
    }
  },

  /**
   * Gets a random yell message based on the focus and work status
   * @param isWork Whether the screen content is work-related
   * @param isFocused Whether the user is focused on the screen
   * @param gazeDirection Optional gaze direction information
   * @returns A message to yell
   */
  getYellMessage: (isWork: boolean, isFocused: boolean, gazeDirection?: string): string => {
    if (!isWork) {
      return ttsService.getRandomMessage('distraction');
    }
    
    if (!isFocused) {
      if (gazeDirection === 'away') {
        return ttsService.getRandomMessage('lookingAway');
      }
      return ttsService.getRandomMessage('notFocused');
    }
    
    // If working and focused, return a positive message
    return ttsService.getRandomMessage('encouragement');
  },

  /**
   * Finds the best voice for a given yell style
   * @param style The style of yell
   * @returns The most appropriate voice for the style
   */
  findVoiceForStyle: (style: YellStyle): SpeechSynthesisVoice | null => {
    // Load voices if not loaded yet
    if (availableVoices.length === 0) {
      availableVoices = window.speechSynthesis.getVoices();
    }
    
    if (!availableVoices || availableVoices.length === 0) {
      console.warn('No voices available');
      return null;
    }
    
    let preferredLanguage = 'en-US';
    let preferredVoice = '';
    
    // Set preferred voice name based on style
    switch (style) {
      case 'drill_sergeant':
        preferredVoice = 'Google US English Male';
        break;
      case 'friendly':
        preferredVoice = 'Google US English Female';
        break;
      case 'motivational':
        preferredVoice = 'Microsoft David';
        break;
      case 'coach':
      default:
        preferredVoice = 'Microsoft Mark'; // Default stern voice
    }
    
    // Try to find the preferred voice
    let voice = availableVoices.find(v => v.name === preferredVoice);
    
    // Fall back to any English voice
    if (!voice) {
      voice = availableVoices.find(v => v.lang.startsWith('en'));
    }
    
    // Fall back to any voice
    if (!voice && availableVoices.length > 0) {
      voice = availableVoices[0];
    }
    
    // Ensure we return null instead of undefined if no voice is found
    return voice || null;
  },
  
  /**
   * Safely attempts to resume speech if necessary
   */
  safelyResumeSpeech: () => {
    if (window.speechSynthesis && window.speechSynthesis.paused) {
      try {
        window.speechSynthesis.resume();
        console.log('Resumed speech synthesis');
      } catch (error) {
        console.error('Error resuming speech synthesis:', error);
        // Safely handle the error without crashing
        ttsService.resetSpeech();
      }
    }
  },

  /**
   * Completely resets the speech synthesis engine
   */
  resetSpeech: (): void => {
    try {
      // Cancel any existing speech synthesis
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      
      // Reset state variables
      isSpeaking = false;
      currentUtterance = null;
      
      // Also stop any background audio
      if (backgroundAudioNode) {
        try {
          backgroundAudioNode.stop();
          backgroundAudioNode.disconnect();
          backgroundAudioNode = null;
        } catch (err) {
          console.warn('Error stopping background audio:', err);
        }
      }
    } catch (error) {
      console.warn('Error during speech reset:', error);
    }
  },

  /**
   * Plays a yell using the browser's speech synthesis
   * @param message The message to yell
   * @param style The style of the yell
   */
  playYell: (message: string, style: YellStyle = 'coach'): void => {
    console.log(`Playing yell in ${style} style: "${message}"`);
    
    // If page is not visible, try to request background permissions
    if (document.hidden) {
      console.log('Page is hidden, requesting background permissions before yelling');
      ttsService.requestBackgroundPermissions();
    }
    
    try {
      // Reset any ongoing speech first
      ttsService.resetSpeech();
      
      // Create a new utterance
      currentUtterance = new SpeechSynthesisUtterance(message);
      
      // Apply voice settings based on style
      const settings = ttsService.getVoiceSettingsForStyle(style);
      currentUtterance.voice = settings.voice;
      currentUtterance.rate = settings.rate;
      currentUtterance.pitch = settings.pitch;
      currentUtterance.volume = settings.volume;
      
      // Set up event handlers
      currentUtterance.onstart = () => {
        console.log('Speech started');
        isSpeaking = true;
      };
      
      currentUtterance.onend = () => {
        console.log('Speech ended');
        isSpeaking = false;
        currentUtterance = null;
      };
      
      currentUtterance.onerror = (event) => {
        // Ignore intentional interruptions during visibility change
        if (shouldPreventInterruptErrors && event.error === 'interrupted') {
          console.log('Ignoring expected speech interruption due to visibility change');
          return;
        }
        
        console.error(`Speech error: ${event}`);
        console.log(`Error details: ${event.error}`);
        
        // Handle specific error types
        if (event.error === 'interrupted') {
          console.log('Speech was interrupted - attempting to recover');
          
          // If we're visible, try to restart or reset
          if (!document.hidden) {
            setTimeout(() => {
              ttsService.resetSpeech();
              // Don't automatically retry to avoid potential loops
            }, 500);
          }
        }
        
        // Clean up state
        isSpeaking = false;
        currentUtterance = null;
      };
      
      // Even if hidden, still attempt to speak
      window.speechSynthesis.speak(currentUtterance);
      
      // If in background, also try alternate methods
      if (document.hidden) {
        // Use Audio Context as a backup
        if (audioContext) {
          ttsService.attemptBackgroundAudio(message);
        }
        
        // Try using notification as a fallback
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Just Do The Thing', {
            body: message,
            icon: '/favicon.ico',
            tag: 'productivity-alert'
          });
          console.log('Sent notification as backup for background audio');
        }
      }
    } catch (error) {
      console.error('Error playing yell:', error);
      isSpeaking = false;
      currentUtterance = null;
    }
  },

  // Attempt to play audio in background using Audio API
  attemptBackgroundAudio: (message: string) => {
    try {
      if (!audioContext) return;
      
      // Create oscillator for a simple alert sound
      const oscillator = audioContext.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // 440Hz = A4
      
      const gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // Low volume
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Play a short beep
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3); // Play for 300ms
      
      console.log('Played background audio alert');
      
      // Also request a notification if available
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Just Do The Thing', {
          body: 'Your productivity monitor has a message for you!',
          icon: '/favicon.ico'
        });
      } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    } catch (error) {
      console.warn('Error playing background audio:', error);
    }
  },

  /**
   * Get voice settings based on yell style
   */
  getVoiceSettingsForStyle: (style: YellStyle): { voice: SpeechSynthesisVoice | null, rate: number, pitch: number, volume: number } => {
    // Default settings
    const defaultSettings = {
      voice: null as SpeechSynthesisVoice | null,
      rate: 1.1,
      pitch: 1.1,
      volume: 0.9
    };
    
    // Find appropriate voice
    const voice = ttsService.findVoiceForStyle(style);
    if (voice) {
      defaultSettings.voice = voice;
    }
    
    // Configure settings based on style
    switch (style) {
      case 'drill_sergeant':
        return {
          ...defaultSettings,
          pitch: 1.2,
          rate: 1.3,
          volume: 1.0
        };
      case 'friendly':
        return {
          ...defaultSettings,
          pitch: 1.0,
          rate: 0.9,
          volume: 0.8
        };
      case 'motivational':
        return {
          ...defaultSettings,
          pitch: 1.1,
          rate: 1.0,
          volume: 0.9
        };
      case 'coach':
      default:
        return defaultSettings;
    }
  },

  /**
   * Get a random message for the given category
   */
  getRandomMessage: (category: 'distraction' | 'notFocused' | 'lookingAway' | 'encouragement'): string => {
    let messages: string[] = [];
    
    switch (category) {
      case 'distraction':
        messages = [
          "Hey! I see you're distracted. Get back to work!",
          "You're not working! Focus on your tasks.",
          "Stop procrastinating and get back to what's important!",
          "That doesn't look like work to me. Let's get back on track.",
          "Distractions will only slow you down. Back to work!"
        ];
        break;
      case 'notFocused':
        messages = [
          "You seem distracted. Remember your goals.",
          "Your focus is drifting. Bring it back to the task at hand.",
          "Stay present with your work.",
          "Concentrate! You can do this.",
          "Mind wandering? Refocus on what matters."
        ];
        break;
      case 'lookingAway':
        messages = [
          "Eyes on the screen! That's where your work is.",
          "I can tell you're looking away. Stay engaged with your task.",
          "Looking for inspiration elsewhere? It's right here in front of you.",
          "Your attention is needed on your work, not elsewhere.",
          "Keep your eyes on the prize - which is on your screen!"
        ];
        break;
      case 'encouragement':
        messages = [
          "Great focus! Keep it up!",
          "You're doing well! Stay on track.",
          "Excellent concentration. You're making progress!",
          "That's it! Keep working like that.",
          "Fantastic job staying focused!"
        ];
        break;
    }
    
    // Get a random message
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  }
}; 