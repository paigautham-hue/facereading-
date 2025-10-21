import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { Sparkles, Camera, Check, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

const IMAGE_TYPES = [
  { type: "frontal_neutral", label: "Frontal View (Neutral)", instruction: "Look straight at the camera with a neutral expression" },
  { type: "frontal_smile", label: "Frontal View (Smiling)", instruction: "Look straight at the camera and smile naturally" },
  { type: "left_profile", label: "Left Profile (90°)", instruction: "Turn your head to show your left side profile" },
  { type: "right_profile", label: "Right Profile (90°)", instruction: "Turn your head to show your right side profile" },
  { type: "three_quarter_left", label: "Three-Quarter Left (45°)", instruction: "Turn your head 45° to the left" },
  { type: "three_quarter_right", label: "Three-Quarter Right (45°)", instruction: "Turn your head 45° to the right" },
  { type: "closeup_eyes", label: "Close-up: Eyes", instruction: "Move closer to capture a clear view of your eyes" },
  { type: "closeup_nose", label: "Close-up: Nose", instruction: "Move closer to capture a clear view of your nose" },
  { type: "closeup_mouth", label: "Close-up: Mouth", instruction: "Move closer to capture a clear view of your mouth and lips" },
  { type: "closeup_ears", label: "Close-up: Ears", instruction: "Capture a clear view of both ears" },
] as const;

export default function NewReading() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [capturedImages, setCapturedImages] = useState<Record<string, string>>({});
  const [readingId, setReadingId] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const createReadingMutation = trpc.faceReading.createReading.useMutation();
  const uploadImageMutation = trpc.faceReading.uploadImage.useMutation();
  const startAnalysisMutation = trpc.faceReading.startAnalysis.useMutation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  useEffect(() => {
    // Create reading on mount
    if (!readingId && isAuthenticated) {
      createReadingMutation.mutate(undefined, {
        onSuccess: (data) => {
          setReadingId(data.readingId);
        },
        onError: (error) => {
          toast.error("Failed to create reading: " + error.message);
        },
      });
    }
  }, [readingId, isAuthenticated]);

  useEffect(() => {
    // Start camera when capturing
    if (isCapturing) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isCapturing]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1280, height: 720 },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast.error("Failed to access camera. Please grant camera permissions.");
      console.error("Camera error:", error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !readingId) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const imageData = canvas.toDataURL("image/jpeg", 0.9);

    // Save locally
    const currentType = IMAGE_TYPES[currentStep].type;
    setCapturedImages((prev) => ({ ...prev, [currentType]: imageData }));

    // Upload to server
    uploadImageMutation.mutate(
      {
        readingId,
        imageType: currentType,
        imageData,
      },
      {
        onSuccess: () => {
          toast.success("Photo captured successfully!");
          setIsCapturing(false);
          
          // Move to next step if not last
          if (currentStep < IMAGE_TYPES.length - 1) {
            setCurrentStep(currentStep + 1);
          }
        },
        onError: (error) => {
          toast.error("Failed to upload photo: " + error.message);
        },
      }
    );
  };

  const handleFinish = () => {
    if (!readingId) return;

    startAnalysisMutation.mutate(
      { readingId },
      {
        onSuccess: () => {
          toast.success("Analysis started! This may take a few minutes.");
          setLocation("/dashboard");
        },
        onError: (error) => {
          toast.error("Failed to start analysis: " + error.message);
        },
      }
    );
  };

  const progress = ((currentStep + 1) / IMAGE_TYPES.length) * 100;
  const currentImageType = IMAGE_TYPES[currentStep];
  const isCurrentCaptured = !!capturedImages[currentImageType.type];
  const allCaptured = IMAGE_TYPES.every((img) => capturedImages[img.type]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-semibold">New Reading</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Step {currentStep + 1} of {IMAGE_TYPES.length}
              </span>
              <span className="font-medium">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Capture Card */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                {currentImageType.label}
              </CardTitle>
              <CardDescription>{currentImageType.instruction}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Camera View or Preview */}
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                {isCapturing ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    {/* Face outline overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-64 border-4 border-primary/50 rounded-full" />
                    </div>
                  </>
                ) : isCurrentCaptured ? (
                  <img
                    src={capturedImages[currentImageType.type]}
                    alt={currentImageType.label}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Camera className="w-16 h-16 text-muted-foreground mx-auto" />
                      <p className="text-muted-foreground">Click button below to start camera</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex gap-4">
                {!isCapturing ? (
                  <>
                    <Button
                      onClick={() => setIsCapturing(true)}
                      className="flex-1"
                      disabled={uploadImageMutation.isPending}
                      size="lg"
                    >
                      <Camera className="mr-2 h-5 w-5" />
                      {isCurrentCaptured ? "Retake Photo" : "Start Camera"}
                    </Button>
                    {isCurrentCaptured && currentStep < IMAGE_TYPES.length - 1 && (
                      <Button
                        onClick={() => setCurrentStep(currentStep + 1)}
                        variant="outline"
                        size="lg"
                      >
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button
                      onClick={capturePhoto}
                      className="flex-1"
                      disabled={uploadImageMutation.isPending || !stream}
                      size="lg"
                    >
                      {uploadImageMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Uploading...
                        </>
                      ) : !stream ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Starting Camera...
                        </>
                      ) : (
                        <>
                          <Camera className="mr-2 h-5 w-5" />
                          Capture Photo
                        </>
                      )}
                    </Button>
                    <Button onClick={() => setIsCapturing(false)} variant="outline" size="lg">
                      Cancel
                    </Button>
                  </>
                )}
              </div>

              {/* Finish Button */}
              {allCaptured && (
                <Button
                  onClick={handleFinish}
                  size="lg"
                  className="w-full"
                  disabled={startAnalysisMutation.isPending}
                >
                  {startAnalysisMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Starting Analysis...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Complete & Analyze
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Thumbnail Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Captured Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {IMAGE_TYPES.map((img, index) => (
                  <button
                    key={img.type}
                    onClick={() => setCurrentStep(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      currentStep === index
                        ? "border-primary ring-2 ring-primary/20"
                        : capturedImages[img.type]
                        ? "border-primary/30"
                        : "border-muted"
                    }`}
                  >
                    {capturedImages[img.type] ? (
                      <>
                        <img
                          src={capturedImages[img.type]}
                          alt={img.label}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 right-1 bg-primary rounded-full p-1">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">{index + 1}</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

