import React from 'react';

interface ScreenViewProps {
  screenshot: string | null;
  isWork: boolean | null;
}

function ScreenView({ screenshot, isWork }: ScreenViewProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Screen Monitoring</h3>
      <div className="relative overflow-hidden rounded-md bg-gray-100 aspect-video">
        {screenshot ? (
          <img 
            src={screenshot} 
            alt="Current screen" 
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-500">Waiting for screen capture...</p>
          </div>
        )}
        
        {/* Classification status indicator */}
        {screenshot && (
          <div className={`absolute top-2 right-2 px-2 py-1 rounded text-white text-xs
            ${isWork === null ? 'bg-gray-500' : isWork ? 'bg-green-500' : 'bg-red-500'}`}>
            {isWork === null ? 'Analyzing...' : isWork ? 'Work Content' : 'Non-Work Content'}
          </div>
        )}
      </div>
      
      <div className="mt-3 text-sm text-gray-600">
        <p>
          Your screen is monitored to detect if you're working on productive content.
          All processing is done locally in your browser and screenshots are never stored or transmitted.
        </p>
      </div>
    </div>
  );
}

export default ScreenView; 