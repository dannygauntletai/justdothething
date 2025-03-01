import React from 'react';
import { useYellModeStore } from '../../services/yellModeStore';
import { YellStyle } from '../../services/ttsService';

function YellSettingsCard() {
  const { settings, updateSettings } = useYellModeStore();
  
  // Handle check interval change
  const handleIntervalChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ checkInterval: event.target.value });
  };
  
  // Handle yell style change
  const handleStyleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as YellStyle;
    updateSettings({ yellStyle: value });
  };
  
  // Handle cooldown change
  const handleCooldownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ yellCooldown: event.target.value });
  };
  
  // Handle face detection toggle
  const handleFaceDetectionToggle = () => {
    updateSettings({ useFaceDetection: !settings.useFaceDetection });
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6 col-span-1 md:col-span-2">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Yell Mode Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="check-interval" className="block text-sm font-medium text-gray-700">
            Check Interval
          </label>
          <select
            id="check-interval"
            value={settings.checkInterval}
            onChange={handleIntervalChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="5">5 seconds</option>
            <option value="10">10 seconds</option>
            <option value="15">15 seconds</option>
            <option value="30">30 seconds</option>
            <option value="60">1 minute</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            How often to check your productivity status
          </p>
        </div>
        
        <div>
          <label htmlFor="yell-style" className="block text-sm font-medium text-gray-700">
            Coach Style
          </label>
          <select
            id="yell-style"
            value={settings.yellStyle}
            onChange={handleStyleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="coach">Supportive Coach</option>
            <option value="drill_sergeant">Drill Sergeant</option>
            <option value="friendly">Friendly Reminder</option>
            <option value="motivational">Motivational Speaker</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            The tone and style of the vocal reminders
          </p>
        </div>
        
        <div>
          <label htmlFor="yell-cooldown" className="block text-sm font-medium text-gray-700">
            Reminder Cooldown
          </label>
          <select
            id="yell-cooldown"
            value={settings.yellCooldown}
            onChange={handleCooldownChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="10">10 seconds</option>
            <option value="30">30 seconds</option>
            <option value="60">1 minute</option>
            <option value="120">2 minutes</option>
            <option value="300">5 minutes</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Minimum time between vocal reminders
          </p>
        </div>
        
        <div className="flex items-center h-full">
          <button
            type="button"
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              settings.useFaceDetection ? 'bg-blue-500' : 'bg-gray-200'
            }`}
            role="switch"
            aria-checked={settings.useFaceDetection}
            onClick={handleFaceDetectionToggle}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.useFaceDetection ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <div className="ml-3">
            <span className="text-sm font-medium text-gray-700">Use Face Detection</span>
            <p className="text-xs text-gray-500">
              Monitor if you're looking at the screen
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default YellSettingsCard; 