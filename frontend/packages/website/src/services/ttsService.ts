// Available voices for the yells
export type YellStyle = 'coach' | 'drill_sergeant' | 'friendly' | 'motivational';

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
  init: (): Promise<void> => {
    return new Promise((resolve) => {
      console.log('Initializing speech synthesis...');
      
      // Function to get voices when they're available
      const getVoices = () => {
        // Chrome and Edge get voices asynchronously
        availableVoices = window.speechSynthesis.getVoices();
        console.log(`Got ${availableVoices.length} voices`);
        
        if (availableVoices.length > 0) {
          availableVoices.forEach((voice, i) => {
            console.log(`Voice ${i}: ${voice.name} (${voice.lang})`);
          });
          resolve();
        } else {
          // If no voices are available, try again later
          setTimeout(getVoices, 100);
        }
      };
      
      // Some browsers set voices immediately
      if (window.speechSynthesis) {
        availableVoices = window.speechSynthesis.getVoices();
        
        if (availableVoices.length > 0) {
          console.log('Voices available immediately');
          getVoices();
        } else {
          // Chrome requires waiting for the voiceschanged event
          console.log('Waiting for voices to load...');
          window.speechSynthesis.addEventListener('voiceschanged', getVoices);
        }
      } else {
        console.warn('Speech synthesis not supported');
        resolve(); // Resolve anyway to not block the app
      }
    });
  },

  /**
   * Gets a random yell message based on the focus and work status
   * @param isWork Whether the screen content is work-related
   * @param isFocused Whether the user is focused on the screen
   * @param gazeDirection Optional gaze direction information
   * @returns A message to yell
   */
  getYellMessage: (isWork: boolean, isFocused: boolean, gazeDirection?: string): string => {
    // Get a random message from the appropriate category
    const getRandomMessage = (messages: string[]): string => {
      return messages[Math.floor(Math.random() * messages.length)];
    };

    // Define messages for different scenarios
    const notWorkingMessages = [
      "What the fuck? That doesn't look like work!",
      "Are you fucking kidding me? That's what you're focusing on right now?",
      "Get back to the goddamn task at hand, NOW!",
      "Distraction detected! Get your shit together and refocus.",
      "I see you've wandered off task. Get the fuck back to it!",
      "That looks interesting, but it's not going to finish your fucking work."
    ];

    const notFocusedMessages = [
      "I notice you're not looking at the screen. Focus, dammit!",
      "Eyes on the fucking screen, now!",
      "Keep your attention on the task, asshole.",
      "You seem distracted. Stop that shit and refocus!",
      "I need your full fucking attention here.",
      "Are you with me? Let's focus on the damn screen."
    ];

    const gazeLeftMessages = [
      "I see you're looking to the left. Focus on the fucking screen!",
      "Your attention seems to be on the left. Back to the center, you idiot!",
      "Eyes wandering to the left? Get back to the damn task.",
      "What's so fucking interesting on the left? Your work is right in front of you!"
    ];

    const gazeRightMessages = [
      "I notice you're looking to the right. Focus on the fucking screen!",
      "Your attention seems to be on the right. Back to the center, you moron!",
      "Eyes wandering to the right? Get back to the damn task.",
      "What's so fucking interesting on the right? Your work is right in front of you!"
    ];

    const gazeUpMessages = [
      "Looking up? Focus on the damn screen!",
      "Your attention seems to be above the screen. Get your shit back together!",
      "Eyes wandering upward? The important stuff is right in front of your face, dickhead.",
      "What's so fucking interesting up there? Your work is waiting, asshole!"
    ];

    const gazeDownMessages = [
      "Looking down? Focus on the damn screen!",
      "Your attention seems to be below the screen. Get back to it, idiot!",
      "Eyes wandering downward? The important stuff is right in front of your stupid face.",
      "What's so fucking interesting down there? Your work is waiting, shithead!"
    ];

    const bothMessages = [
      "You're not only off-task, but you're not even fucking looking at it!",
      "Double fucking trouble: off-topic and not focused. Fix both, now!",
      "Not working AND not paying attention? Jesus Christ, get your shit together!",
      "Two issues: wrong content and lack of focus. Get back on fucking track!"
    ];

    // Determine the appropriate message
    if (!isWork && !isFocused) {
      return getRandomMessage(bothMessages);
    } else if (!isWork) {
      return getRandomMessage(notWorkingMessages);
    } else if (!isFocused) {
      // If we have gaze direction info, use it for more specific messages
      if (gazeDirection) {
        switch (gazeDirection) {
          case 'LEFT':
            return getRandomMessage(gazeLeftMessages);
          case 'RIGHT':
            return getRandomMessage(gazeRightMessages);
          case 'UP':
            return getRandomMessage(gazeUpMessages);
          case 'DOWN':
            return getRandomMessage(gazeDownMessages);
          default:
            return getRandomMessage(notFocusedMessages);
        }
      }
      return getRandomMessage(notFocusedMessages);
    }

    // Default fallback
    return "Let's stay focused on our fucking work.";
  },

  /**
   * Finds the best voice for a given yell style
   * @param style The style of yell
   * @returns The most appropriate voice for the style
   */
  findVoiceForStyle: (style: YellStyle): SpeechSynthesisVoice | null => {
    // If no voices are available, return null
    if (!availableVoices.length) {
      console.warn('No voices available');
      return null;
    }
    
    let preferredVoice: SpeechSynthesisVoice | null = null;
    
    // Find a voice based on style preference
    switch (style) {
      case 'drill_sergeant':
        // Prefer deeper male voices
        preferredVoice = availableVoices.find(voice => 
          voice.name.toLowerCase().includes('male') && 
          !voice.name.toLowerCase().includes('female') &&
          (voice.name.toLowerCase().includes('us') || voice.lang.startsWith('en-US'))
        ) || null;
        break;
        
      case 'friendly':
        // Prefer female voices
        preferredVoice = availableVoices.find(voice => 
          voice.name.toLowerCase().includes('female') &&
          (voice.name.toLowerCase().includes('us') || voice.lang.startsWith('en-US'))
        ) || null;
        break;
        
      case 'motivational':
        // Prefer clear voices
        preferredVoice = availableVoices.find(voice => 
          (voice.name.toLowerCase().includes('google') || voice.name.toLowerCase().includes('alex')) &&
          (voice.name.toLowerCase().includes('us') || voice.lang.startsWith('en-US'))
        ) || null;
        break;
        
      case 'coach':
      default:
        // Default voice - prefer English (US) voices
        preferredVoice = availableVoices.find(voice => 
          voice.lang.startsWith('en-US') || voice.name.toLowerCase().includes('us')
        ) || null;
    }
    
    // If no matching voice found, just use the first English voice
    if (!preferredVoice) {
      preferredVoice = availableVoices.find(voice => 
        voice.lang.startsWith('en')
      ) || availableVoices[0];
    }
    
    return preferredVoice;
  },

  /**
   * Plays a yell using the browser's speech synthesis
   * @param message The message to yell
   * @param style The style of the yell
   */
  playYell: (message: string, style: YellStyle = 'coach'): void => {
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported in this browser');
      return;
    }
    
    console.log(`Playing yell with style: ${style}, message: "${message}"`);
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(message);
    
    // Find appropriate voice
    const voice = ttsService.findVoiceForStyle(style);
    if (voice) {
      console.log(`Using voice: ${voice.name} (${voice.lang})`);
      utterance.voice = voice;
    } else {
      console.warn('No suitable voice found, using default voice');
    }
    
    // Configure utterance based on style
    switch (style) {
      case 'drill_sergeant':
        utterance.pitch = 1.2;
        utterance.rate = 1.3;
        utterance.volume = 1.0;
        break;
      case 'friendly':
        utterance.pitch = 1.0;
        utterance.rate = 0.9;
        utterance.volume = 0.8;
        break;
      case 'motivational':
        utterance.pitch = 1.1;
        utterance.rate = 1.0;
        utterance.volume = 0.9;
        break;
      case 'coach':
      default:
        utterance.pitch = 1.1;
        utterance.rate = 1.1;
        utterance.volume = 0.9;
    }
    
    // Add event handlers for debugging
    utterance.onstart = () => console.log('Speech started');
    utterance.onend = () => console.log('Speech ended');
    utterance.onerror = (event) => console.error('Speech error:', event);
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Play the yell
    window.speechSynthesis.speak(utterance);
  },

  /**
   * Stops any ongoing speech
   */
  stopSpeech: (): void => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}; 