import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

// Define work-related and non-work-related concepts for semantic comparison
// These are concept anchors rather than exact labels to match
const WORK_CONCEPTS = [
  'office', 'business', 'document', 'presentation',
  'spreadsheet', 'meeting', 'research', 'development',
  'programming', 'code', 'workplace', 'desk', 'laptop',
  // Add software development specific concepts
  'editor', 'terminal', 'console', 'script', 'developer', 
  'software', 'application', 'interface', 'text editor',
  'window', 'screen', 'monitor', 'display',
  // Add more specific technical concepts
  'IDE', 'repository', 'function', 'variable', 'method',
  'browser', 'website', 'framework', 'algorithm', 'database',
  'keyboard', 'typing', 'mouse', 'cursor', 'pointer'
];

const NON_WORK_CONCEPTS = [
  'entertainment', 'game', 'social media', 'relaxation', 
  'streaming', 'sports', 'food', 'beverage',
  'home', 'hobby', 'music', 'movie', 'show',
  // Add specific streaming services
  'netflix', 'hulu', 'disney', 'amazon prime', 'hbo', 'youtube',
  'peacock', 'paramount', 'apple tv', 'twitch', 'roku', 'tubi',
  'crunchyroll', 'espn', 'sling', 'fubo', 'discovery', 'plex',
  // Add more leisure categories
  'gaming', 'video game', 'social', 'chat', 'news', 'shopping',
  'cooking', 'recipe', 'travel', 'vacation', 'fitness', 'workout',
  'podcast', 'audiobook', 'ebook', 'comic', 'manga', 'animation'
];

// Define semantic similarity thresholds - DECREASED to catch more work-related items
const SIMILARITY_THRESHOLD = 0.60;

// Define special high-confidence work signals that should be detected with lower thresholds
const HIGH_CONFIDENCE_WORK_SIGNALS = [
  'code', 'editor', 'terminal', 'console', 'programming', 'development',
  'browser', 'window', 'application', 'software', 'IDE', 'document'
];

// Define high-confidence non-work signals that should be detected with lower thresholds
const HIGH_CONFIDENCE_NON_WORK_SIGNALS = [
  'netflix', 'hulu', 'streaming', 'game', 'youtube', 'twitch',
  'movie', 'show', 'entertainment', 'disney', 'hbo', 'prime video'
];

// Threshold specifically for high-confidence work signals
const HIGH_CONFIDENCE_WORK_THRESHOLD = 0.50;

// Threshold specifically for high-confidence non-work signals
const HIGH_CONFIDENCE_NON_WORK_THRESHOLD = 0.45;

// Special UI patterns that indicate work environments
const UI_PATTERNS = {
  codeEditor: ['window', 'text', 'line', 'screen', 'display', 'rectangle', 'interface', 'toolbar'],
  spreadsheet: ['cell', 'grid', 'table', 'row', 'column', 'sheet', 'data'],
  document: ['page', 'text', 'line', 'paragraph', 'document', 'content'],
  browser: ['tab', 'browser', 'webpage', 'website', 'toolbar', 'navigation'],
  application: ['window', 'toolbar', 'menu', 'interface', 'button', 'panel']
};

// Add UI patterns that indicate non-work environments
const NON_WORK_UI_PATTERNS = {
  streaming: ['video', 'player', 'stream', 'movie', 'show', 'episode', 'series', 'watch', 
              'play', 'pause', 'fullscreen', 'volume', 'playlist', 'recommended', 'trailer'],
  gaming: ['game', 'play', 'score', 'level', 'character', 'controller', 'mission', 'quest',
           'achievement', 'leaderboard', 'multiplayer', 'inventory', 'weapon', 'enemy'],
  social: ['post', 'feed', 'profile', 'friend', 'like', 'share', 'comment', 'message', 
          'notification', 'timeline', 'status', 'photo', 'video', 'story', 'chat']
};

// Contextual classification rules
// These rules help classify based on combinations of elements
const CONTEXT_RULES = [
  // Priority work contexts
  { elements: ['document', 'text', 'writing'], score: 0.8, type: 'work' },
  { elements: ['code', 'programming', 'development'], score: 0.9, type: 'work' },
  { elements: ['spreadsheet', 'numbers', 'chart'], score: 0.8, type: 'work' },
  { elements: ['meeting', 'presentation', 'conference'], score: 0.7, type: 'work' },
  // Code editor specific rules
  { elements: ['window', 'text', 'line'], score: 0.85, type: 'work' },
  { elements: ['editor', 'text', 'window'], score: 0.85, type: 'work' },
  { elements: ['rectangle', 'text', 'screen'], score: 0.7, type: 'work' },
  // Browser-based work
  { elements: ['browser', 'tab', 'website'], score: 0.65, type: 'work' },
  { elements: ['application', 'interface', 'window'], score: 0.65, type: 'work' },
  // Technical indicators
  { elements: ['site', 'web', 'page'], score: 0.6, type: 'work' },
  { elements: ['keyboard', 'typing', 'text'], score: 0.7, type: 'work' },
  
  // Priority non-work contexts
  { elements: ['game', 'playing', 'controller'], score: 0.9, type: 'non-work' },
  { elements: ['social', 'media', 'chat'], score: 0.8, type: 'non-work' },
  { elements: ['video', 'streaming', 'entertainment'], score: 0.8, type: 'non-work' },
  { elements: ['food', 'drink', 'restaurant'], score: 0.7, type: 'non-work' },
  
  // Streaming service specific rules
  { elements: ['video', 'player', 'watch'], score: 0.85, type: 'non-work' },
  { elements: ['movie', 'show', 'episode'], score: 0.9, type: 'non-work' },
  { elements: ['netflix', 'series', 'watch'], score: 0.95, type: 'non-work' },
  { elements: ['hulu', 'stream', 'watch'], score: 0.95, type: 'non-work' },
  { elements: ['disney', 'plus', 'watch'], score: 0.95, type: 'non-work' },
  { elements: ['prime', 'video', 'amazon'], score: 0.95, type: 'non-work' },
  { elements: ['hbo', 'max', 'watch'], score: 0.95, type: 'non-work' },
  { elements: ['youtube', 'video', 'channel'], score: 0.9, type: 'non-work' },
  { elements: ['play', 'pause', 'fullscreen'], score: 0.8, type: 'non-work' },
  
  // Gaming specific rules
  { elements: ['game', 'level', 'score'], score: 0.9, type: 'non-work' },
  { elements: ['play', 'character', 'mission'], score: 0.9, type: 'non-work' },
  
  // Social media specific rules
  { elements: ['post', 'feed', 'profile'], score: 0.85, type: 'non-work' },
  { elements: ['friend', 'like', 'comment'], score: 0.85, type: 'non-work' },
  { elements: ['timeline', 'message', 'notification'], score: 0.85, type: 'non-work' }
];

// Constants for logging levels
const LOG_LEVELS = {
  NONE: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4,
  VERBOSE: 5
};

// Store model once loaded to avoid reloading
let modelPromise: Promise<mobilenet.MobileNet> | null = null;
let modelLoadingStarted = false;

// Cache recent classification results (simple LRU cache)
interface CachedResult {
  result: ClassificationResult;
  timestamp: number;
}
const classificationCache: Map<string, CachedResult> = new Map();
const CACHE_TTL_MS = 60000; // 1 minute cache validity
const MAX_CACHE_SIZE = 20;

export interface ClassificationResult {
  isWork: boolean;
  confidence: number;
  predictions: {
    className: string;
    probability: number;
  }[];
  timestamp: number;
  // Add additional contextual information
  detectedWorkItems?: string[];
  detectedNonWorkItems?: string[];
  imageAnalysis?: {
    brightness?: number;
    colorVariance?: number;
    textDensity?: number;
  };
  // Add debugging information
  debugInfo?: {
    decisions?: string[];
    workScore?: number;
    nonWorkScore?: number;
    error?: string;
  };
}

/**
 * Configuration for the classification service
 */
const CONFIG = {
  CONFIDENCE_THRESHOLD: 0.60, // Reduced from 0.65 to make work detection more likely
  PREDICTION_COUNT: 25, // Increased to get more potential matches
  MIN_CLASS_PROBABILITY: 0.08, // Reduced to include more potential signals
  HIGH_CONFIDENCE_BOOST: 2.2, // Increased to boost work signals
  DEFAULT_WORK_BIAS: 0.55, // Increased work bias to favor work classification
  CACHE_ENABLED: true,
  USE_SEMANTIC_SIMILARITY: true,
  CONTEXT_WEIGHT: 0.65, // Increased context weight
  ENABLE_UI_PATTERN_DETECTION: true,
  LOG_LEVEL: LOG_LEVELS.DEBUG, // Set default log level
  FAVOR_WORK_IN_AMBIGUOUS_CASES: true, // New flag to bias toward work in ambiguous cases
  CODE_LAYOUT_THRESHOLD: 0.12, // Lower threshold for code layout detection
  UI_PATTERN_MATCH_THRESHOLD: 0.4, // Lowered from 0.5 to detect more UI patterns
  STREAMING_CONTENT_DETECTION: true, // Enable special detection for streaming content
  ENABLE_NON_WORK_UI_PATTERNS: true, // Enable detection of non-work UI patterns
};

/**
 * Service for classifying screen content as work or non-work related using TensorFlow.js
 */
export const workClassificationService = {
  /**
   * Initialize TensorFlow.js and preload the model
   */
  init: async (): Promise<void> => {
    workClassificationService.log('Initializing TensorFlow.js...', LOG_LEVELS.INFO);
    try {
      // Ensure TensorFlow.js backend is initialized
      await tf.ready();
      workClassificationService.log(`TensorFlow.js backend ready: ${tf.getBackend()}`, LOG_LEVELS.INFO);
      
      // Start loading the model in the background
      workClassificationService.getModel();
    } catch (error) {
      workClassificationService.log('Error initializing TensorFlow.js:', LOG_LEVELS.ERROR, error);
    }
  },

  /**
   * Enhanced logging function with support for different log levels
   * @param message The message to log
   * @param level The log level (default: INFO)
   * @param data Optional data to include with the log
   */
  log: (message: string, level: number = LOG_LEVELS.INFO, data?: any): void => {
    if (level <= CONFIG.LOG_LEVEL) {
      const prefix = (() => {
        switch (level) {
          case LOG_LEVELS.ERROR: return '[ERROR] 🔴';
          case LOG_LEVELS.WARN: return '[WARN] 🟠';
          case LOG_LEVELS.INFO: return '[INFO] 🔵';
          case LOG_LEVELS.DEBUG: return '[DEBUG] 🟢';
          case LOG_LEVELS.VERBOSE: return '[VERBOSE] ⚪';
          default: return '';
        }
      })();
      
      if (data !== undefined) {
        console.log(`${prefix} ${message}`, data);
      } else {
        console.log(`${prefix} ${message}`);
      }
    }
  },

  /**
   * Ensures the model is loaded before classification
   * @returns Promise resolving to the MobileNet model
   */
  getModel: async (): Promise<mobilenet.MobileNet> => {
    // Load model if not already loading
    if (!modelPromise && !modelLoadingStarted) {
      console.log('Loading MobileNet model...');
      modelLoadingStarted = true;
      
      try {
        // Load MobileNet model
        modelPromise = mobilenet.load({
          version: 2,
          alpha: 0.5 // Use a smaller model for faster inference
        });
        
        // Log when model is successfully loaded
        const model = await modelPromise;
        console.log('MobileNet model loaded successfully');
        return model;
      } catch (error) {
        console.error('Error loading MobileNet model:', error);
        modelLoadingStarted = false;
        modelPromise = null;
        throw error;
      }
    } else if (!modelPromise && modelLoadingStarted) {
      // If loading started but modelPromise is null, there was an error
      console.log('Model loading already attempted but failed, retrying...');
      modelLoadingStarted = false;
      return workClassificationService.getModel();
    }
    
    return modelPromise!;
  },

  /**
   * Calculate image brightness as an additional signal
   * @param tensor The image tensor
   * @returns A value between 0-1 indicating brightness
   */
  calculateBrightness: (tensor: tf.Tensor3D): number => {
    try {
      // Convert to grayscale and calculate mean brightness
      const grayscale = tf.tidy(() => {
        // RGB to grayscale conversion
        const rgb = tf.split(tensor, 3, 2);
        return tf.add(
          tf.mul(rgb[0], 0.299),
          tf.add(
            tf.mul(rgb[1], 0.587),
            tf.mul(rgb[2], 0.114)
          )
        );
      });
      
      // Get mean brightness and normalize to 0-1
      const mean = tf.tidy(() => tf.mean(grayscale).div(255));
      const brightness = mean.dataSync()[0];
      
      // Clean up tensors
      grayscale.dispose();
      mean.dispose();
      
      return brightness;
    } catch (error) {
      console.error('Error calculating brightness:', error);
      return 0.5; // Default to middle value
    }
  },

  /**
   * Calculate color variance as a signal (high variance often indicates graphics/entertainment)
   * @param tensor The image tensor
   * @returns A value indicating color variance
   */
  calculateColorVariance: (tensor: tf.Tensor3D): number => {
    try {
      // Calculate variance across color channels
      const variance = tf.tidy(() => {
        // Get standard deviation across all pixels and channels
        const std = tf.moments(tensor).variance.sqrt();
        return tf.mean(std).div(255); // Normalize
      });
      
      const result = variance.dataSync()[0];
      variance.dispose();
      
      return result;
    } catch (error) {
      console.error('Error calculating color variance:', error);
      return 0.5; // Default to middle value
    }
  },

  /**
   * Analyze a cached image hash to avoid redundant classifications
   * @param dataUrl The image data URL to hash
   * @returns A simple hash string
   */
  getImageHash: (dataUrl: string): string => {
    // Create a simple hash based on a substring of the data
    // Not cryptographically secure but sufficient for caching
    const hashSource = dataUrl.substring(0, 1000) + dataUrl.length;
    let hash = 0;
    for (let i = 0; i < hashSource.length; i++) {
      const char = hashSource.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  },

  /**
   * Calculate semantic similarity between a word and a concept
   * @param word The word to compare
   * @param concept The concept to compare against
   * @returns A similarity score between 0-1
   */
  calculateSimilarity: (word: string, concept: string): number => {
    // Simple character-level similarity (Jaccard index)
    // In a production environment, this would use word embeddings (word2vec, GloVe, etc.)
    word = word.toLowerCase();
    concept = concept.toLowerCase();
    
    // Direct match
    if (word === concept) return 1.0;
    // Partial match - increased strictness by reducing score from 0.8 to 0.7
    if (word.includes(concept) || concept.includes(word)) return 0.7;
    
    // For shorter words, require more specificity
    if (word.length < 4 || concept.length < 4) {
      // If both are very short words, comparison may be unreliable
      return 0.2; // Lower baseline similarity for short words
    }
    
    // Calculate character-level similarity
    const wordChars = new Set(word.split(''));
    const conceptChars = new Set(concept.split(''));
    
    // Intersection
    const intersection = new Set([...wordChars].filter(x => conceptChars.has(x)));
    
    // Union
    const union = new Set([...wordChars, ...conceptChars]);
    
    // Apply a penalty for length differences
    const lengthRatio = Math.min(word.length, concept.length) / Math.max(word.length, concept.length);
    
    // Jaccard index with length penalty
    return (intersection.size / union.size) * lengthRatio;
  },

  /**
   * Calculate semantic similarity to work or non-work concepts
   * @param word The word to evaluate
   * @returns Object with work and non-work similarity scores
   */
  evaluateSemanticSimilarity: (word: string): { workSimilarity: number, nonWorkSimilarity: number } => {
    // Calculate highest similarity to any work concept
    const workSimilarity = Math.max(...WORK_CONCEPTS.map(concept => 
      workClassificationService.calculateSimilarity(word, concept)
    ));
    
    // Calculate highest similarity to any non-work concept
    const nonWorkSimilarity = Math.max(...NON_WORK_CONCEPTS.map(concept => 
      workClassificationService.calculateSimilarity(word, concept)
    ));
    
    return { workSimilarity, nonWorkSimilarity };
  },

  /**
   * Evaluate contextual rules based on detected items
   * @param detectedItems List of items detected in the image
   * @returns A work and non-work score based on context rules
   */
  evaluateContext: (detectedItems: string[]): { workScore: number, nonWorkScore: number } => {
    let workScore = 0;
    let nonWorkScore = 0;
    
    // Convert detected items to lowercase
    const normalizedItems = detectedItems.map(item => item.toLowerCase());
    
    // Check each context rule
    for (const rule of CONTEXT_RULES) {
      // Count how many elements from the rule match
      const matchCount = rule.elements.filter(element => 
        normalizedItems.some(item => item.includes(element))
      ).length;
      
      // Calculate match ratio
      const matchRatio = matchCount / rule.elements.length;
      
      // Apply score if at least half of the elements match
      if (matchRatio >= 0.5) {
        const appliedScore = rule.score * matchRatio;
        
        if (rule.type === 'work') {
          workScore += appliedScore;
        } else {
          nonWorkScore += appliedScore;
        }
      }
    }
    
    return { workScore, nonWorkScore };
  },

  /**
   * Detect if predictions match UI patterns typical of work applications
   * @param predictions List of predicted items from MobileNet
   * @returns An object with scores for different UI patterns
   */
  detectUiPatterns: (predictions: {className: string, probability: number}[]): {
    codeEditorScore: number,
    spreadsheetScore: number,
    documentScore: number,
    browserScore: number,
    applicationScore: number,
    // Add non-work pattern scores
    streamingScore: number,
    gamingScore: number,
    socialScore: number
  } => {
    // Extract all detected classes
    const detectedClasses = predictions
      .filter(p => p.probability >= CONFIG.MIN_CLASS_PROBABILITY * 0.8) // Use an even lower threshold for UI pattern detection
      .map(p => p.className.toLowerCase());
    
    // Initialize scores
    let codeEditorScore = 0;
    let spreadsheetScore = 0;
    let documentScore = 0;
    let browserScore = 0;
    let applicationScore = 0;
    
    // Initialize non-work scores
    let streamingScore = 0;
    let gamingScore = 0;
    let socialScore = 0;
    
    // Check how many UI pattern elements for different applications are present
    const codeEditorMatches = UI_PATTERNS.codeEditor.filter(pattern => 
      detectedClasses.some(cls => cls.includes(pattern))
    );
    
    const spreadsheetMatches = UI_PATTERNS.spreadsheet.filter(pattern => 
      detectedClasses.some(cls => cls.includes(pattern))
    );
    
    const documentMatches = UI_PATTERNS.document.filter(pattern => 
      detectedClasses.some(cls => cls.includes(pattern))
    );
    
    const browserMatches = UI_PATTERNS.browser.filter(pattern => 
      detectedClasses.some(cls => cls.includes(pattern))
    );
    
    const applicationMatches = UI_PATTERNS.application.filter(pattern => 
      detectedClasses.some(cls => cls.includes(pattern))
    );
    
    // Calculate scores based on match percentages
    codeEditorScore = codeEditorMatches.length / UI_PATTERNS.codeEditor.length;
    spreadsheetScore = spreadsheetMatches.length / UI_PATTERNS.spreadsheet.length;
    documentScore = documentMatches.length / UI_PATTERNS.document.length;
    browserScore = browserMatches.length / UI_PATTERNS.browser.length;
    applicationScore = applicationMatches.length / UI_PATTERNS.application.length;
    
    // Apply a boost for significant pattern matches
    if (codeEditorScore > CONFIG.UI_PATTERN_MATCH_THRESHOLD) codeEditorScore *= 1.5;
    if (spreadsheetScore > CONFIG.UI_PATTERN_MATCH_THRESHOLD) spreadsheetScore *= 1.5;
    if (documentScore > CONFIG.UI_PATTERN_MATCH_THRESHOLD) documentScore *= 1.5;
    if (browserScore > CONFIG.UI_PATTERN_MATCH_THRESHOLD) browserScore *= 1.5;
    if (applicationScore > CONFIG.UI_PATTERN_MATCH_THRESHOLD) applicationScore *= 1.5;
    
    // Check for non-work UI patterns if enabled
    if (CONFIG.ENABLE_NON_WORK_UI_PATTERNS) {
      const streamingMatches = NON_WORK_UI_PATTERNS.streaming.filter(pattern => 
        detectedClasses.some(cls => cls.includes(pattern))
      );
      
      const gamingMatches = NON_WORK_UI_PATTERNS.gaming.filter(pattern => 
        detectedClasses.some(cls => cls.includes(pattern))
      );
      
      const socialMatches = NON_WORK_UI_PATTERNS.social.filter(pattern => 
        detectedClasses.some(cls => cls.includes(pattern))
      );
      
      // Calculate non-work scores
      streamingScore = streamingMatches.length / NON_WORK_UI_PATTERNS.streaming.length;
      gamingScore = gamingMatches.length / NON_WORK_UI_PATTERNS.gaming.length;
      socialScore = socialMatches.length / NON_WORK_UI_PATTERNS.social.length;
      
      // Apply boosts for significant non-work pattern matches
      // Use a lower threshold for streaming content to make detection more sensitive
      if (streamingScore > CONFIG.UI_PATTERN_MATCH_THRESHOLD * 0.8) streamingScore *= 2.0;
      if (gamingScore > CONFIG.UI_PATTERN_MATCH_THRESHOLD) gamingScore *= 1.8;
      if (socialScore > CONFIG.UI_PATTERN_MATCH_THRESHOLD) socialScore *= 1.8;
      
      // Special case for streaming services - check for known service names
      const streamingServices = ['netflix', 'hulu', 'disney', 'prime', 'amazon', 'hbo', 
                                 'youtube', 'peacock', 'paramount', 'apple tv', 'twitch', 
                                 'roku', 'tubi', 'crunchyroll', 'espn', 'sling', 'fubo', 
                                 'discovery', 'plex'];
      
      const serviceMatches = streamingServices.filter(service => 
        detectedClasses.some(cls => cls.includes(service))
      );
      
      if (serviceMatches.length > 0) {
        // Direct streaming service match - give a significant boost
        streamingScore = Math.max(streamingScore, 0.75);
        workClassificationService.log(`Detected streaming service(s): ${serviceMatches.join(', ')}`, LOG_LEVELS.INFO);
      }
    }
    
    // Detailed logging
    workClassificationService.log('UI Pattern detection results:', LOG_LEVELS.DEBUG, {
      codeEditor: {
        score: codeEditorScore.toFixed(2),
        matches: codeEditorMatches.join(', ')
      },
      spreadsheet: {
        score: spreadsheetScore.toFixed(2),
        matches: spreadsheetMatches.join(', ')
      },
      document: {
        score: documentScore.toFixed(2),
        matches: documentMatches.join(', ')
      },
      browser: {
        score: browserScore.toFixed(2),
        matches: browserMatches.join(', ')
      },
      application: {
        score: applicationScore.toFixed(2),
        matches: applicationMatches.join(', ')
      },
      // Add non-work pattern logging
      ...(CONFIG.ENABLE_NON_WORK_UI_PATTERNS ? {
        streaming: {
          score: streamingScore.toFixed(2),
          matches: NON_WORK_UI_PATTERNS.streaming.filter(pattern => 
            detectedClasses.some(cls => cls.includes(pattern))
          ).join(', ')
        },
        gaming: {
          score: gamingScore.toFixed(2),
          matches: NON_WORK_UI_PATTERNS.gaming.filter(pattern => 
            detectedClasses.some(cls => cls.includes(pattern))
          ).join(', ')
        },
        social: {
          score: socialScore.toFixed(2),
          matches: NON_WORK_UI_PATTERNS.social.filter(pattern => 
            detectedClasses.some(cls => cls.includes(pattern))
          ).join(', ')
        }
      } : {})
    });
    
    return {
      codeEditorScore,
      spreadsheetScore,
      documentScore,
      browserScore,
      applicationScore,
      // Include non-work scores
      streamingScore: CONFIG.ENABLE_NON_WORK_UI_PATTERNS ? streamingScore : 0,
      gamingScore: CONFIG.ENABLE_NON_WORK_UI_PATTERNS ? gamingScore : 0,
      socialScore: CONFIG.ENABLE_NON_WORK_UI_PATTERNS ? socialScore : 0
    };
  },

  /**
   * Detect if the screen has characteristics of a code editor
   * @param tensor The image tensor
   * @returns A boolean indicating if the screen likely contains code
   */
  detectCodeLayout: (tensor: tf.Tensor3D): {isCodeLayout: boolean, confidence: number} => {
    try {
      // Code editors typically have line-by-line text with consistent spacing
      // We can detect this by analyzing horizontal variance in the image
      
      // First get grayscale image
      const grayscale = tf.tidy(() => {
        const rgb = tf.split(tensor, 3, 2);
        return tf.add(
          tf.mul(rgb[0], 0.299),
          tf.add(
            tf.mul(rgb[1], 0.587),
            tf.mul(rgb[2], 0.114)
          )
        );
      });
      
      // Calculate horizontal variance (looking for consistent line spacing)
      // This is done by taking the mean of each row, then finding the variance between rows
      const horizontalProfile = tf.tidy(() => tf.mean(grayscale, 1));
      const horizontalVariance = tf.tidy(() => {
        const mean = tf.mean(horizontalProfile);
        const diff = tf.sub(horizontalProfile, mean);
        const squaredDiff = tf.mul(diff, diff);
        // Fix: replace tf.stdev (which doesn't exist) with proper standard deviation calculation
        const stdDev = tf.sqrt(tf.mean(tf.square(tf.sub(horizontalProfile, tf.mean(horizontalProfile)))));
        return tf.mean(squaredDiff).div(stdDev.add(tf.scalar(1e-5)));
      });
      
      // Calculate vertical variance (looking for indentation patterns)
      const verticalProfile = tf.tidy(() => tf.mean(grayscale, 0));
      const verticalVariance = tf.tidy(() => {
        const mean = tf.mean(verticalProfile);
        const diff = tf.sub(verticalProfile, mean);
        const squaredDiff = tf.mul(diff, diff);
        // Fix: replace tf.stdev (which doesn't exist) with proper standard deviation calculation
        const stdDev = tf.sqrt(tf.mean(tf.square(tf.sub(verticalProfile, tf.mean(verticalProfile)))));
        return tf.mean(squaredDiff).div(stdDev.add(tf.scalar(1e-5)));
      });
      
      // Get concrete values from tensors
      const hVarianceValue = horizontalVariance.dataSync()[0];
      const vVarianceValue = verticalVariance.dataSync()[0];
      
      // Cleanup tensors
      grayscale.dispose();
      horizontalProfile.dispose();
      horizontalVariance.dispose();
      verticalProfile.dispose();
      verticalVariance.dispose();
      
      // Code editors typically have moderate horizontal variance (line spacing)
      // and higher vertical variance (indentation)
      // Lowered thresholds to catch more potential code layouts
      const isCodeLayout = (
        hVarianceValue > CONFIG.CODE_LAYOUT_THRESHOLD && hVarianceValue < 0.7 && 
        vVarianceValue > CONFIG.CODE_LAYOUT_THRESHOLD
      );
      
      // Calculate a confidence score
      const confidence = (
        Math.min(Math.max(hVarianceValue, 0.1), 0.5) * 0.5 + 
        Math.min(Math.max(vVarianceValue, 0.1), 0.7) * 0.5
      );
      
      workClassificationService.log(`Code layout detection: hVariance=${hVarianceValue.toFixed(3)}, vVariance=${vVarianceValue.toFixed(3)}, confidence=${confidence.toFixed(3)}, isCodeLayout=${isCodeLayout}`, LOG_LEVELS.DEBUG);
      
      return { isCodeLayout, confidence };
    } catch (error) {
      workClassificationService.log('Error in code layout detection:', LOG_LEVELS.ERROR, error);
      return { isCodeLayout: false, confidence: 0 };
    }
  },

  /**
   * Classifies a screenshot as work-related or not
   * @param dataUrl The screenshot data URL to classify
   * @returns Promise resolving to classification result
   */
  classifyScreenshot: async (dataUrl: string): Promise<ClassificationResult> => {
    workClassificationService.log('Starting screenshot classification...', LOG_LEVELS.INFO);
    try {
      // Check cache first if enabled
      if (CONFIG.CACHE_ENABLED) {
        const imageHash = workClassificationService.getImageHash(dataUrl);
        const cached = classificationCache.get(imageHash);
        
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
          workClassificationService.log('Using cached classification result', LOG_LEVELS.INFO);
          return cached.result;
        }
      }
      
      // Create an Image from the dataURL
      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
      });

      // Convert to tensor
      const tensor = tf.browser.fromPixels(img);
      
      // Log image dimensions for debugging
      const imgShape = tensor.shape;
      workClassificationService.log(`Image dimensions: ${imgShape[1]}x${imgShape[0]}`, LOG_LEVELS.DEBUG);
      
      // Analyze image characteristics
      const brightness = workClassificationService.calculateBrightness(tensor);
      const colorVariance = workClassificationService.calculateColorVariance(tensor);
      
      // Detect code editor layout
      const { isCodeLayout, confidence: codeLayoutConfidence } = workClassificationService.detectCodeLayout(tensor);
      
      workClassificationService.log(`Image analysis: brightness=${brightness.toFixed(3)}, colorVariance=${colorVariance.toFixed(3)}, isCodeLayout=${isCodeLayout}`, LOG_LEVELS.INFO);
      
      // Get model
      const model = await workClassificationService.getModel();
      
      // Run inference with more predictions
      workClassificationService.log('Running MobileNet classification...', LOG_LEVELS.INFO);
      const predictions = await model.classify(tensor, CONFIG.PREDICTION_COUNT);
      workClassificationService.log('Top predictions:', LOG_LEVELS.DEBUG, predictions.slice(0, 5));
      
      // Dispose of tensor to free memory
      tensor.dispose();
      
      // Get all detected class names for context analysis
      const allDetectedItems = predictions
        .filter(p => p.probability >= CONFIG.MIN_CLASS_PROBABILITY)
        .map(p => p.className.toLowerCase());
      
      workClassificationService.log(`Detected ${allDetectedItems.length} items with probability >= ${CONFIG.MIN_CLASS_PROBABILITY}`, LOG_LEVELS.DEBUG);
      
      // Check for UI patterns that might be typical of work applications
      const uiPatterns = CONFIG.ENABLE_UI_PATTERN_DETECTION ? 
        workClassificationService.detectUiPatterns(predictions) : 
        { 
          codeEditorScore: 0, spreadsheetScore: 0, documentScore: 0, browserScore: 0, applicationScore: 0,
          streamingScore: 0, gamingScore: 0, socialScore: 0 
        };
      
      // Initialize results
      let workScore = 0;
      let nonWorkScore = 0;
      const detectedWorkItems: string[] = [];
      const detectedNonWorkItems: string[] = [];
      const debugDecisions: string[] = []; // Track decision points for debugging
      
      // Track the strongest signals for better debugging
      let strongestWorkSignal = { item: '', score: 0 };
      let strongestNonWorkSignal = { item: '', score: 0 };
      
      // Code editor layout provides a strong work signal
      if (isCodeLayout) {
        const addedScore = codeLayoutConfidence * 1.8; // Increased boost
        workScore += addedScore;
        detectedWorkItems.push('code layout');
        debugDecisions.push(`Detected code layout: +${addedScore.toFixed(3)} to work score`);
      }
      
      // Add scores from work UI pattern detection
      const workUiPatternScore = (
        uiPatterns.codeEditorScore + 
        uiPatterns.spreadsheetScore + 
        uiPatterns.documentScore +
        uiPatterns.browserScore +
        uiPatterns.applicationScore
      ) * 0.9; // Increased multiplier
      
      workScore += workUiPatternScore;
      
      if (workUiPatternScore > 0) {
        debugDecisions.push(`Work UI pattern detection: +${workUiPatternScore.toFixed(3)} to work score`);
      }
      
      // Add scores from non-work UI pattern detection
      if (CONFIG.ENABLE_NON_WORK_UI_PATTERNS) {
        const nonWorkUiPatternScore = (
          uiPatterns.streamingScore * 1.3 + // Give streaming a higher weight
          uiPatterns.gamingScore * 1.2 +
          uiPatterns.socialScore
        ) * 1.1; // Boost non-work patterns
        
        nonWorkScore += nonWorkUiPatternScore;
        
        if (nonWorkUiPatternScore > 0) {
          debugDecisions.push(`Non-work UI pattern detection: +${nonWorkUiPatternScore.toFixed(3)} to non-work score`);
        }
        
        // Special handling for strong streaming signals
        if (uiPatterns.streamingScore > 0.5) {
          debugDecisions.push(`Strong streaming content signal detected (${uiPatterns.streamingScore.toFixed(2)})`);
          detectedNonWorkItems.push('streaming content');
        }
      }
      
      // Use semantic similarity approach if enabled
      if (CONFIG.USE_SEMANTIC_SIMILARITY) {
        workClassificationService.log('Using semantic similarity classification', LOG_LEVELS.INFO);
        
        // Process each prediction
        predictions.forEach(prediction => {
          const className = prediction.className.toLowerCase();
          const probability = prediction.probability;
          
          if (probability < CONFIG.MIN_CLASS_PROBABILITY) return;
          
          workClassificationService.log(`Analyzing prediction: ${className} (${probability.toFixed(3)})`, LOG_LEVELS.VERBOSE);
          
          // Check if this is a high-confidence work signal that should use a lower threshold
          const isHighConfidenceWorkSignal = HIGH_CONFIDENCE_WORK_SIGNALS.some(signal => 
            className.includes(signal)
          );
          
          // Check if this is a high-confidence non-work signal
          const isHighConfidenceNonWorkSignal = HIGH_CONFIDENCE_NON_WORK_SIGNALS.some(signal => 
            className.includes(signal)
          );
          
          // Calculate semantic similarity to work and non-work concepts
          const { workSimilarity, nonWorkSimilarity } = workClassificationService.evaluateSemanticSimilarity(className);
          
          workClassificationService.log(`Semantic similarity for "${className}": work=${workSimilarity.toFixed(3)}, non-work=${nonWorkSimilarity.toFixed(3)}`, LOG_LEVELS.DEBUG);
          
          // Apply different thresholds for high-confidence signals
          const effectiveWorkThreshold = isHighConfidenceWorkSignal ? 
            HIGH_CONFIDENCE_WORK_THRESHOLD : SIMILARITY_THRESHOLD;
            
          const effectiveNonWorkThreshold = isHighConfidenceNonWorkSignal ?
            HIGH_CONFIDENCE_NON_WORK_THRESHOLD : SIMILARITY_THRESHOLD;
          
          // Apply scores based on semantic similarity
          if (workSimilarity > effectiveWorkThreshold && workSimilarity > nonWorkSimilarity) {
            // Apply a boost for high-confidence signals
            const boost = isHighConfidenceWorkSignal ? 1.5 : 1.0; // Increased boost
            const score = probability * workSimilarity * boost;
            workScore += score;
            detectedWorkItems.push(className);
            
            debugDecisions.push(`Added work item "${className}": +${score.toFixed(3)} to work score (sim=${workSimilarity.toFixed(2)}, p=${probability.toFixed(2)}, boost=${boost})`);
            
            // Track strongest signal
            if (score > strongestWorkSignal.score) {
              strongestWorkSignal = { item: className, score };
            }
          } 
          else if (nonWorkSimilarity > effectiveNonWorkThreshold && nonWorkSimilarity > workSimilarity) {
            // Apply a boost for high-confidence non-work signals
            const boost = isHighConfidenceNonWorkSignal ? 1.7 : 1.0; // Higher boost for non-work signals
            const score = probability * nonWorkSimilarity * boost;
            nonWorkScore += score;
            detectedNonWorkItems.push(className);
            
            debugDecisions.push(`Added non-work item "${className}": +${score.toFixed(3)} to non-work score (sim=${nonWorkSimilarity.toFixed(2)}, p=${probability.toFixed(2)}, boost=${boost})`);
            
            // Track strongest signal
            if (score > strongestNonWorkSignal.score) {
              strongestNonWorkSignal = { item: className, score };
            }
          }
          else {
            workClassificationService.log(`Neutral item, not clearly work or non-work: ${className}`, LOG_LEVELS.VERBOSE);
            
            // For ambiguous items, slightly favor work classification if the flag is enabled
            if (CONFIG.FAVOR_WORK_IN_AMBIGUOUS_CASES && workSimilarity > 0.3) {
              const smallScore = probability * workSimilarity * 0.3;
              workScore += smallScore;
              debugDecisions.push(`Added ambiguous item with slight work bias "${className}": +${smallScore.toFixed(3)} to work score`);
            }
          }
        });
        
        // Apply context rules
        const { workScore: contextWorkScore, nonWorkScore: contextNonWorkScore } = 
          workClassificationService.evaluateContext(allDetectedItems);
        
        workClassificationService.log(`Context analysis: workScore=${contextWorkScore.toFixed(3)}, nonWorkScore=${contextNonWorkScore.toFixed(3)}`, LOG_LEVELS.DEBUG);
        
        // Blend individual classification with context rules
        const blendRatio = CONFIG.CONTEXT_WEIGHT;
        const oldWorkScore = workScore;
        const oldNonWorkScore = nonWorkScore;
        
        workScore = (workScore * (1 - blendRatio)) + (contextWorkScore * blendRatio);
        nonWorkScore = (nonWorkScore * (1 - blendRatio)) + (contextNonWorkScore * blendRatio);
        
        debugDecisions.push(`Applied context rules: work ${oldWorkScore.toFixed(3)} → ${workScore.toFixed(3)}, non-work ${oldNonWorkScore.toFixed(3)} → ${nonWorkScore.toFixed(3)}`);
      } 
      else {
        // ... existing fallback code ...
      }
      
      // Consider environmental factors in classification
      
      // Very dark screens may indicate inactivity (slightly favor non-work)
      if (brightness < 0.2) {
        const darkPenalty = 0.1;
        nonWorkScore += darkPenalty;
        debugDecisions.push(`Dark screen adjustment: +${darkPenalty} to non-work score`);
      }
      
      // Video content often has higher color variance (favor non-work)
      if (colorVariance > 0.35 && CONFIG.STREAMING_CONTENT_DETECTION) {
        // Apply stronger non-work signals for high color variance which is typical of media content
        const varianceScore = Math.min((colorVariance - 0.35) * 2, 0.5);
        nonWorkScore += varianceScore;
        debugDecisions.push(`High color variance (${colorVariance.toFixed(3)}): +${varianceScore.toFixed(3)} to non-work score (potential media content)`);
      }
      // Low color variance often indicates text/code content (favor work)
      else if (colorVariance < 0.25) {
        const lowVarianceBoost = 0.2; // Increased from 0.15
        workScore += lowVarianceBoost;
        debugDecisions.push(`Low color variance (${colorVariance.toFixed(3)}): +${lowVarianceBoost} to work score`);
      }
      
      // Special detection for known streaming services
      if (CONFIG.STREAMING_CONTENT_DETECTION) {
        // Check for streaming service names in detected items
        const streamingServices = ['netflix', 'hulu', 'disney', 'prime', 'amazon', 'hbo', 
                                  'youtube', 'peacock', 'paramount', 'apple tv', 'twitch'];
        
        const matchedStreamingServices = streamingServices.filter(service => 
          allDetectedItems.some(item => item.includes(service))
        );
        
        if (matchedStreamingServices.length > 0) {
          const streamingBoost = 1.0;
          nonWorkScore += streamingBoost;
          detectedNonWorkItems.push(...matchedStreamingServices);
          debugDecisions.push(`Detected streaming service(s): ${matchedStreamingServices.join(', ')}: +${streamingBoost} to non-work score`);
        }
      }
      
      // Weight scores based on signal count and diversity
      // Having multiple different work signals is a stronger indicator than a single repeated one
      if (detectedWorkItems.length > 3) {
        const diversityBonus = 0.2; // Increased from 0.15
        workScore += diversityBonus;
        debugDecisions.push(`Multiple work signals (${detectedWorkItems.length}): +${diversityBonus} to work score`);
      }
      
      // Similar diversity boost for non-work items
      if (detectedNonWorkItems.length > 3) {
        const diversityBonus = 0.25; // Slightly higher than work bonus
        nonWorkScore += diversityBonus;
        debugDecisions.push(`Multiple non-work signals (${detectedNonWorkItems.length}): +${diversityBonus} to non-work score`);
      }
      
      // Additional check: require at least 2 work signals for borderline cases
      if (detectedWorkItems.length < 2 && workScore > 0 && workScore < 1.0 && !isCodeLayout) {
        const singleItemPenalty = workScore * 0.1;
        workScore *= 0.9; // Apply a 10% penalty for having only one signal
        debugDecisions.push(`Only a single work signal detected: -${singleItemPenalty.toFixed(3)} to work score`);
      }
      
      // Log the strongest signals for debugging
      if (strongestWorkSignal.item) {
        workClassificationService.log(`Strongest work signal: ${strongestWorkSignal.item} (${strongestWorkSignal.score.toFixed(3)})`, LOG_LEVELS.INFO);
      }
      
      if (strongestNonWorkSignal.item) {
        workClassificationService.log(`Strongest non-work signal: ${strongestNonWorkSignal.item} (${strongestNonWorkSignal.score.toFixed(3)})`, LOG_LEVELS.INFO);
      }
      
      // If no relevant labels were found, use heuristics
      if (workScore === 0 && nonWorkScore === 0) {
        workScore = CONFIG.DEFAULT_WORK_BIAS;
        debugDecisions.push(`No clear signals found, using default work bias: ${CONFIG.DEFAULT_WORK_BIAS}`);
      }
      
      // Normalize scores
      const totalScore = workScore + nonWorkScore;
      const workConfidence = totalScore > 0 ? workScore / totalScore : CONFIG.DEFAULT_WORK_BIAS;
      
      // Determine if work-related based on confidence threshold
      const isWork = workConfidence > CONFIG.CONFIDENCE_THRESHOLD;
      
      // Create detailed log of classification process
      workClassificationService.log('Classification details:', LOG_LEVELS.DEBUG, {
        finalScores: {
          workScore: workScore.toFixed(3),
          nonWorkScore: nonWorkScore.toFixed(3),
          totalScore: totalScore.toFixed(3),
          workConfidence: workConfidence.toFixed(3),
          threshold: CONFIG.CONFIDENCE_THRESHOLD,
          result: isWork ? 'WORK' : 'NON-WORK'
        },
        decisions: debugDecisions,
        detectedItems: {
          work: detectedWorkItems,
          nonWork: detectedNonWorkItems
        }
      });
      
      workClassificationService.log(`Classification result: isWork=${isWork}, confidence=${workConfidence.toFixed(3)}`, LOG_LEVELS.INFO);
      
      const result: ClassificationResult = {
        isWork,
        confidence: workConfidence,
        predictions,
        timestamp: Date.now(),
        detectedWorkItems: detectedWorkItems.length > 0 ? detectedWorkItems : undefined,
        detectedNonWorkItems: detectedNonWorkItems.length > 0 ? detectedNonWorkItems : undefined,
        imageAnalysis: {
          brightness,
          colorVariance
        },
        debugInfo: {
          decisions: debugDecisions,
          workScore,
          nonWorkScore
        }
      };
      
      // Cache the result if caching is enabled
      if (CONFIG.CACHE_ENABLED) {
        const imageHash = workClassificationService.getImageHash(dataUrl);
        classificationCache.set(imageHash, { result, timestamp: Date.now() });
        
        // Maintain LRU cache size
        if (classificationCache.size > MAX_CACHE_SIZE) {
          const oldestKey = classificationCache.keys().next().value;
          classificationCache.delete(oldestKey);
        }
      }
      
      return result;
    } catch (error) {
      workClassificationService.log('Classification error:', LOG_LEVELS.ERROR, error);
      // Return a default result if classification fails
      return {
        isWork: true, // Assume work by default to avoid false negatives
        confidence: 0,
        predictions: [],
        timestamp: Date.now(),
        debugInfo: {
          error: String(error)
        }
      };
    }
  }
};

export default workClassificationService; 