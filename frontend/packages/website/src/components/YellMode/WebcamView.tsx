import React, { useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface WebcamViewProps {
  onWebcamRef: (videoElement: HTMLVideoElement | null) => void;
  isFocused: boolean;
  gazeDirection: string;
  eyesOpen: boolean;
}

const WebcamView: React.FC<WebcamViewProps> = ({ 
  onWebcamRef, 
  isFocused,
  gazeDirection,
  eyesOpen
}) => {
  const webcamRef = useRef<Webcam>(null);
  
  // Pass the video element to parent component when webcam loads
  useEffect(() => {
    if (webcamRef.current && webcamRef.current.video) {
      onWebcamRef(webcamRef.current.video);
    } else {
      onWebcamRef(null);
    }
  }, [webcamRef.current, webcamRef.current?.video]);
  
  const videoConstraints = {
    width: 320,
    height: 240,
    facingMode: "user"
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Focus Detection</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          <div className="relative w-full overflow-hidden rounded bg-muted aspect-video flex items-center justify-center">
            <Webcam
              ref={webcamRef}
              audio={false}
              width={320}
              height={240}
              videoConstraints={videoConstraints}
              className="w-full h-full object-cover max-w-full"
              mirrored={true}
            />
            
            <div className={`absolute bottom-0 left-0 right-0 px-2 sm:px-3 py-1 ${isFocused ? 'bg-green-500/80' : 'bg-yellow-500/80'} text-white text-xs flex flex-wrap sm:flex-nowrap justify-between`}>
              <span className="mr-1">{isFocused ? 'Focused' : 'Distracted'}</span>
              <span className="text-xs truncate">{gazeDirection} {!eyesOpen && '- Eyes Closed'}</span>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Face detection is used to determine if you're looking at the screen and staying focused.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebcamView; 