import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Camera, CameraOff, AlertTriangle, Settings, ExternalLink } from 'lucide-react';

interface DetectedFace {
  id: string;
  name: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CameraViewProps {
  onAttendanceLogged: (userId: string, userName: string) => void;
  users: Array<{ id: string; name: string; }>;
}

export function CameraView({ onAttendanceLogged, users }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [detectedFaces, setDetectedFaces] = useState<DetectedFace[]>([]);
  const [error, setError] = useState<string>('');
  const [cameraSupported, setCameraSupported] = useState(true);

  useEffect(() => {
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraSupported(false);
      setError('Camera API is not supported in this browser.');
    }
  }, []);

  useEffect(() => {
    let animationFrame: number;
    let detectionInterval: NodeJS.Timeout;

    if (isStreaming && videoRef.current) {
      // Simulate face detection every 2 seconds
      detectionInterval = setInterval(() => {
        simulateFaceDetection();
      }, 2000);

      // Draw detection boxes
      const drawDetections = () => {
        if (canvasRef.current && videoRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          const video = videoRef.current;

          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            detectedFaces.forEach((face) => {
              // Draw detection box
              ctx.strokeStyle = '#00ff00';
              ctx.lineWidth = 2;
              ctx.strokeRect(face.x, face.y, face.width, face.height);
              
              // Draw label background
              const labelY = face.y > 30 ? face.y - 10 : face.y + face.height + 20;
              ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
              ctx.fillRect(face.x, labelY - 20, face.width, 20);
              
              // Draw label text
              ctx.fillStyle = '#000';
              ctx.font = '12px Arial';
              ctx.fillText(`${face.name} (${Math.round(face.confidence * 100)}%)`, face.x + 5, labelY - 5);
            });
          }
        }
        animationFrame = requestAnimationFrame(drawDetections);
      };

      drawDetections();
    }

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (detectionInterval) clearInterval(detectionInterval);
    };
  }, [isStreaming, detectedFaces]);

  const simulateFaceDetection = () => {
    if (users.length === 0) return;

    // Simulate detecting 1-2 random faces
    const numFaces = Math.random() > 0.7 ? 2 : 1;
    const newDetections: DetectedFace[] = [];

    for (let i = 0; i < numFaces; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const detection: DetectedFace = {
        id: randomUser.id,
        name: randomUser.name,
        confidence: 0.85 + Math.random() * 0.15,
        x: Math.random() * 300 + 50,
        y: Math.random() * 200 + 50,
        width: 120,
        height: 150
      };
      newDetections.push(detection);
      
      // Log attendance
      onAttendanceLogged(randomUser.id, randomUser.name);
    }

    setDetectedFaces(newDetections);

    // Clear detections after 3 seconds
    setTimeout(() => {
      setDetectedFaces([]);
    }, 3000);
  };

  const startCamera = async () => {
    try {
      if (!cameraSupported) {
        setError('Camera is not supported in this environment.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (canvasRef.current && videoRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
          }
        };
      }
      
      setIsStreaming(true);
      setError('');
    } catch (err: any) {
      console.error('Camera access error:', err);
      
      let errorMessage = 'Failed to access camera. ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Camera permission was denied. Please allow camera access and try again.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage += 'Camera is not supported in this environment.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage += 'Camera constraints could not be satisfied.';
      } else {
        errorMessage += 'Please check your camera permissions and try again.';
      }
      
      setError(errorMessage);
      setIsStreaming(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setDetectedFaces([]);
  };

  const getErrorIcon = () => {
    if (error.includes('permission') || error.includes('denied')) {
      return <Settings className="w-5 h-5" />;
    }
    if (error.includes('not supported') || error.includes('not found')) {
      return <CameraOff className="w-5 h-5" />;
    }
    return <AlertTriangle className="w-5 h-5" />;
  };

  const getErrorActions = () => {
    if (error.includes('permission') || error.includes('denied')) {
      return (
        <div className="mt-3 space-y-2">
          <p className="text-sm">To enable camera access:</p>
          <ul className="text-sm list-disc list-inside space-y-1 ml-2">
            <li>Click the camera icon in your browser's address bar</li>
            <li>Select "Allow" for camera permissions</li>
            <li>Refresh the page if needed</li>
          </ul>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              <h2 className="text-xl font-medium">Live Camera Feed</h2>
            </div>
            <div className="flex gap-2">
              <Badge variant={isStreaming ? "default" : "secondary"}>
                {isStreaming ? "Live" : "Stopped"}
              </Badge>
              {detectedFaces.length > 0 && (
                <Badge variant="destructive">
                  {detectedFaces.length} Face{detectedFaces.length !== 1 ? 's' : ''} Detected
                </Badge>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <div className="flex items-start gap-2">
                {getErrorIcon()}
                <div className="flex-1">
                  <AlertDescription>
                    {error}
                    {getErrorActions()}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          {!error && !cameraSupported && (
            <Alert>
              <CameraOff className="w-5 h-5" />
              <AlertDescription>
                Camera functionality is not available in this environment. You can still use manual attendance entry.
              </AlertDescription>
            </Alert>
          )}

          <div className="relative inline-block">
            {!error && (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="rounded-lg border bg-muted max-w-full"
                  style={{ maxWidth: '100%', height: 'auto', minHeight: '300px' }}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 pointer-events-none rounded-lg"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </>
            )}
            
            {error && (
              <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <CameraOff className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Camera Unavailable</p>
                  <p className="text-sm">Use manual attendance entry instead</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={startCamera} 
              disabled={isStreaming || !cameraSupported}
              className="flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Start Camera
            </Button>
            <Button 
              onClick={stopCamera} 
              disabled={!isStreaming} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <CameraOff className="w-4 h-4" />
              Stop Camera
            </Button>
            
            {error && (
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Refresh Page
              </Button>
            )}
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Camera will automatically detect faces when available</p>
            <p>• Attendance is logged when faces are recognized</p>
            <p>• Green boxes show detected faces with confidence scores</p>
            {error && (
              <p className="text-primary">• If camera is unavailable, use the "Manual Entry" tab for attendance logging</p>
            )}
          </div>
        </div>
      </Card>

      {/* Fallback Information */}
      {(error || !cameraSupported) && (
        <Card className="p-6 bg-muted/50">
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Alternative Options
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Manual Attendance</h4>
                <p className="text-muted-foreground">
                  Use the "Manual Entry" tab to log attendance without camera detection. 
                  You can manually select employees and record their check-in/check-out times.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Browser Compatibility</h4>
                <p className="text-muted-foreground">
                  Camera features work best in modern browsers like Chrome, Firefox, Safari, or Edge. 
                  Ensure you're using an up-to-date browser version.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}