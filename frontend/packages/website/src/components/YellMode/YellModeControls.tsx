import React from 'react';
import { Button } from '../ui/button';

interface YellModeControlsProps {
  isActive: boolean;
  isInitialized: boolean;
  onToggle: () => void;
  lastCheckTime: Date | null;
  productivityState: {
    isWork: boolean;
    contentConfidence: number;
    isFocused: boolean;
    detectedWorkItems: string[];
    detectedNonWorkItems: string[];
    gazeDirection: string;
    eyesOpen: boolean;
  };
}

/**
 * Controls for toggling Yell Mode on and off
 */
const YellModeControls: React.FC<YellModeControlsProps> = ({ 
  isActive, 
  isInitialized,
  onToggle, 
  lastCheckTime, 
  productivityState
}) => {
  const isWorkClass = productivityState.isWork ? 'text-green-600' : 'text-red-600';
  const isFocusedClass = productivityState.isFocused ? 'text-green-600' : 'text-yellow-600';
  
  return (
    <div className="space-y-3">
      <div className="flex flex-col space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${productivityState.isWork ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>Content: <span className={isWorkClass}>{productivityState.isWork ? 'Work' : 'Non-Work'}</span></span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${productivityState.isFocused ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span>Focus: <span className={isFocusedClass}>{productivityState.isFocused ? 'Focused' : 'Distracted'}</span></span>
          </div>
        </div>
        
        {lastCheckTime && (
          <div className="text-xs text-gray-500 mt-1">
            Last Check: {lastCheckTime.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default YellModeControls; 