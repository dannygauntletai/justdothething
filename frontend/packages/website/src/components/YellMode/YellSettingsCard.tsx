import React from 'react';
import { useYellModeStore } from '../../services/yellModeStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

const YellSettingsCard: React.FC = () => {
  const { settings, updateSettings } = useYellModeStore();
  
  // Handle check interval change
  const handleIntervalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ checkInterval: e.target.value });
  };
  
  // Handle yell style change
  const handleVoiceStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ yellStyle: e.target.value });
  };
  
  // Handle face detection toggle
  const handleFaceDetectionToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ useFaceDetection: e.target.checked });
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Yell Mode Settings</CardTitle>
        <CardDescription>Customize how Yell Mode operates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="check-interval" className="block text-sm font-medium text-gray-700 mb-1">
              Check Interval
            </label>
            <select
              id="check-interval"
              value={settings.checkInterval}
              onChange={handleIntervalChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="10">10 seconds</option>
              <option value="30">30 seconds</option>
              <option value="60">1 minute</option>
              <option value="120">2 minutes</option>
              <option value="300">5 minutes</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="yell-style" className="block text-sm font-medium text-gray-700 mb-1">
              Voice Style
            </label>
            <select
              id="yell-style"
              value={settings.yellStyle}
              onChange={handleVoiceStyleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="encouraging">Encouraging Coach</option>
              <option value="stern">Stern Teacher</option>
              <option value="drill">Drill Sergeant</option>
              <option value="friendly">Friendly Reminder</option>
            </select>
          </div>
        </div>
        
        <div>
          <div className="flex items-center mt-2">
            <input
              id="use-face-detection"
              type="checkbox"
              checked={settings.useFaceDetection}
              onChange={handleFaceDetectionToggle}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="use-face-detection" className="ml-2 block text-sm text-gray-700">
              Use face tracking to improve focus detection
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            Enables webcam to detect if you're looking away from the screen
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default YellSettingsCard; 