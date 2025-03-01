import React from 'react';

interface YellModeControlsProps {
  isActive: boolean;
  onToggle: () => void;
  error: string | null;
  isInitialized: boolean;
}

/**
 * Controls for toggling Yell Mode on and off
 */
const YellModeControls: React.FC<YellModeControlsProps> = ({ 
  isActive, 
  onToggle, 
  error,
  isInitialized
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between">
      <div className="mb-4 md:mb-0">
        <h2 className="text-xl font-semibold text-gray-800">Yell Mode</h2>
        <p className="text-gray-600">
          Monitors your productivity and keeps you focused by giving audible reminders when you get distracted.
        </p>
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
      </div>
      
      <button
        onClick={onToggle}
        disabled={!isInitialized}
        className={`${
          isActive 
            ? 'bg-red-600 hover:bg-red-700' 
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white py-2 px-6 rounded-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isActive ? 'focus:ring-red-500' : 'focus:ring-blue-500'
        } ${!isInitialized ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isActive ? 'Deactivate' : 'Activate'} Yell Mode
      </button>
      
      {isActive && (
        <div className="mt-4 md:mt-0 md:ml-4 text-xs text-green-600">
          <p>Yell Mode is active and monitoring your productivity.</p>
        </div>
      )}
    </div>
  );
};

export default YellModeControls; 