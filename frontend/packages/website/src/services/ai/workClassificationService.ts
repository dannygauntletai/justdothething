import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

// Define work-related and non-work-related labels with expanded, more detailed sets
const WORK_RELATED_LABELS = [
  // Hardware
  'laptop', 'monitor', 'desktop', 'computer', 'notebook', 'keyboard', 'mouse', 'trackpad',
  'webcam', 'headset', 'microphone', 'server', 'router', 'docking station', 'printer',
  // Office environment
  'desk', 'office', 'cubicle', 'workstation', 'conference room', 'meeting room', 'whiteboard',
  'projector', 'podium', 'briefcase', 'id badge', 'business card',
  // Work content
  'document', 'spreadsheet', 'chart', 'graph', 'presentation', 'email', 'calendar',
  'code', 'programming', 'algorithm', 'database', 'browser', 'website', 'application',
  'report', 'analysis', 'research', 'proposal', 'plan', 'strategy',
  // Work objects
  'notepad', 'planner', 'binder', 'folder', 'stapler', 'paper', 'pen', 'pencil', 
  'highlighter', 'marker', 'notebook', 'agenda', 'calculator', 'clipboard',
  // Software interfaces
  'spreadsheet', 'word processor', 'terminal', 'IDE', 'editor', 'dashboard', 'analytics',
  'project management', 'messaging', 'video conferencing', 'virtual meeting'
];

const NON_WORK_RELATED_LABELS = [
  // Entertainment
  'game', 'gaming', 'controller', 'console', 'playstation', 'xbox', 'nintendo', 'steam',
  'television', 'tv', 'movie', 'film', 'show', 'series', 'stream', 'entertainment',
  'youtube', 'netflix', 'hulu', 'disney', 'amazon prime', 'streaming',
  // Social media
  'social', 'social media', 'facebook', 'instagram', 'twitter', 'tiktok', 'snapchat',
  'reddit', 'pinterest', 'dating app', 'tinder', 'bumble',
  // Leisure activities
  'game controller', 'joystick', 'remote control', 'guitar', 'instrument', 'sports',
  'exercise', 'workout', 'fitness', 'yoga', 'meditation', 'dance',
  // Food and drink
  'food', 'meal', 'snack', 'lunch', 'dinner', 'breakfast', 'restaurant',
  'drink', 'beverage', 'coffee', 'tea', 'soda', 'alcohol', 'wine', 'beer',
  // Personal devices
  'phone', 'smartphone', 'mobile', 'tablet', 'ipad', 'handheld', 'airpods',
  'headphones', 'watch', 'smartwatch', 'fitbit', 'apple watch',
  // Home elements
  'couch', 'sofa', 'bed', 'bedroom', 'kitchen', 'bathroom', 'living room',
  'home', 'house', 'apartment', 'pet', 'dog', 'cat'
];

// High confidence work/non-work indicators (stronger signals)
const HIGH_CONFIDENCE_WORK = [
  'spreadsheet', 'code', 'document', 'email client', 'word processor',
  'presentation', 'database', 'IDE', 'terminal', 'office', 'meeting',
  'conference', 'dashboard', 'analytics', 'project management'
];

const HIGH_CONFIDENCE_NON_WORK = [
  'game', 'gaming', 'netflix', 'youtube', 'social media', 'facebook',
  'instagram', 'twitter', 'tiktok', 'entertainment', 'movie', 'television',
  'tv show', 'sports', 'restaurant', 'beach', 'party'
];

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
}

/**
 * Configuration for the classification service
 */
const CONFIG = {
  CONFIDENCE_THRESHOLD: 0.65, // Higher threshold for more certain classification
  PREDICTION_COUNT: 15, // Increased from 10 to capture more potential classes
  MIN_CLASS_PROBABILITY: 0.15, // Minimum probability to consider a class relevant
  HIGH_CONFIDENCE_BOOST: 1.5, // Boost factor for high confidence labels
  DEFAULT_WORK_BIAS: 0.52, // Slight bias toward work classification when uncertain
  CACHE_ENABLED: true
};

/**
 * Service for classifying screen content as work or non-work related using TensorFlow.js
 */
export const workClassificationService = {
  /**
   * Initialize TensorFlow.js and preload the model
   */
  init: async (): Promise<void> => {
    console.log('Initializing TensorFlow.js...');
    try {
      // Ensure TensorFlow.js backend is initialized
      await tf.ready();
      console.log('TensorFlow.js backend ready:', tf.getBackend());
      
      // Start loading the model in the background
      workClassificationService.getModel();
    } catch (error) {
      console.error('Error initializing TensorFlow.js:', error);
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
   * Classifies a screenshot as work-related or not
   * @param dataUrl The screenshot data URL to classify
   * @returns Promise resolving to classification result
   */
  classifyScreenshot: async (dataUrl: string): Promise<ClassificationResult> => {
    console.log('Starting screenshot classification...');
    try {
      // Check cache first if enabled
      if (CONFIG.CACHE_ENABLED) {
        const imageHash = workClassificationService.getImageHash(dataUrl);
        const cached = classificationCache.get(imageHash);
        
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
          console.log('Using cached classification result');
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
      
      // Analyze image characteristics
      const brightness = workClassificationService.calculateBrightness(tensor);
      const colorVariance = workClassificationService.calculateColorVariance(tensor);
      
      console.log(`Image analysis: brightness=${brightness.toFixed(3)}, colorVariance=${colorVariance.toFixed(3)}`);
      
      // Get model
      const model = await workClassificationService.getModel();
      
      // Run inference with more predictions
      console.log('Running MobileNet classification...');
      const predictions = await model.classify(tensor, CONFIG.PREDICTION_COUNT);
      console.log('Classification complete:', predictions);
      
      // Dispose of tensor to free memory
      tensor.dispose();
      
      // Calculate work-related confidence with improved algorithm
      let workScore = 0;
      let nonWorkScore = 0;
      const detectedWorkItems: string[] = [];
      const detectedNonWorkItems: string[] = [];
      
      predictions.forEach(prediction => {
        const className = prediction.className.toLowerCase();
        const probability = prediction.probability;
        
        if (probability < CONFIG.MIN_CLASS_PROBABILITY) return;
        
        console.log(`Analyzing prediction: ${className} (${probability.toFixed(3)})`);
        
        // Check for high confidence labels first (stronger signals)
        const isHighConfidenceWork = HIGH_CONFIDENCE_WORK.some(label => 
          className.includes(label.toLowerCase())
        );
        
        const isHighConfidenceNonWork = HIGH_CONFIDENCE_NON_WORK.some(label => 
          className.includes(label.toLowerCase())
        );
        
        // Then check for regular work/non-work labels
        const isWorkRelated = isHighConfidenceWork || WORK_RELATED_LABELS.some(label => 
          className.includes(label.toLowerCase())
        );
        
        const isNonWorkRelated = isHighConfidenceNonWork || NON_WORK_RELATED_LABELS.some(label => 
          className.includes(label.toLowerCase())
        );
        
        // Apply boosting for high confidence matches
        if (isHighConfidenceWork) {
          console.log(`Found HIGH CONFIDENCE work item: ${className}`);
          workScore += probability * CONFIG.HIGH_CONFIDENCE_BOOST;
          detectedWorkItems.push(className);
        } else if (isWorkRelated) {
          console.log(`Found work-related term in: ${className}`);
          workScore += probability;
          detectedWorkItems.push(className);
        }
        
        if (isHighConfidenceNonWork) {
          console.log(`Found HIGH CONFIDENCE non-work item: ${className}`);
          nonWorkScore += probability * CONFIG.HIGH_CONFIDENCE_BOOST;
          detectedNonWorkItems.push(className);
        } else if (isNonWorkRelated) {
          console.log(`Found non-work-related term in: ${className}`);
          nonWorkScore += probability;
          detectedNonWorkItems.push(className);
        }
      });
      
      // Consider environmental factors in classification
      
      // Very dark screens may indicate inactivity (slightly favor non-work)
      if (brightness < 0.2) {
        console.log('Screen appears dark, slightly adjusting scores');
        nonWorkScore += 0.1;
      }
      
      // High color variance often indicates entertainment content
      if (colorVariance > 0.45) {
        console.log('High color variance detected, may indicate graphics/entertainment content');
        nonWorkScore += 0.15;
      }
      
      // If no relevant labels were found, use heuristics
      if (workScore === 0 && nonWorkScore === 0) {
        console.log('No clear work/non-work labels found, using heuristic');
        // Apply default bias toward work to reduce false negatives
        workScore = CONFIG.DEFAULT_WORK_BIAS;
      }
      
      // Normalize scores
      const totalScore = workScore + nonWorkScore;
      const workConfidence = totalScore > 0 ? workScore / totalScore : CONFIG.DEFAULT_WORK_BIAS;
      
      // Determine if work-related based on confidence threshold
      const isWork = workConfidence > CONFIG.CONFIDENCE_THRESHOLD;
      console.log(`Classification result: isWork=${isWork}, confidence=${workConfidence.toFixed(3)}`);
      console.log(`Work items: ${detectedWorkItems.join(', ')}`);
      console.log(`Non-work items: ${detectedNonWorkItems.join(', ')}`);
      
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
      console.error('Classification error:', error);
      // Return a default result if classification fails
      return {
        isWork: true, // Assume work by default to avoid false positives
        confidence: 0,
        predictions: [],
        timestamp: Date.now()
      };
    }
  }
};

export default workClassificationService; 