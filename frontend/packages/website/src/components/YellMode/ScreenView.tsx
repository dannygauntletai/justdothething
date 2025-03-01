import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface ScreenViewProps {
  screenshot: string;
  isWork?: boolean;
  confidence?: number;
  detectedItems?: string[];
}

const ScreenView: React.FC<ScreenViewProps> = ({ 
  screenshot,
  isWork = true,
  confidence = 0,
  detectedItems = []
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Screen Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          <div className="relative aspect-video overflow-hidden rounded border border-muted">
            <img 
              src={screenshot} 
              alt="Screen capture" 
              className="w-full h-full object-contain max-w-full"
            />
            <div className="absolute bottom-0 left-0 right-0 px-2 sm:px-3 py-1 bg-black/60 text-white text-xs">
              <div className="truncate">
                {isWork
                  ? "Working content detected"
                  : "Non-work content detected"}
                {confidence > 0 && ` (${(confidence * 100).toFixed(0)}% confidence)`}
              </div>
            </div>
          </div>
          
          {detectedItems.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Detected: </span>
              {detectedItems.join(', ')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScreenView; 