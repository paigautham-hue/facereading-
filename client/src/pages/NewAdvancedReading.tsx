import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { APP_LOGO } from "@/const";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, Upload, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

const IMAGE_TYPES = [
  { id: "frontal_neutral", label: "Frontal (Neutral)", description: "Face forward, neutral expression" },
  { id: "frontal_smile", label: "Frontal (Smile)", description: "Face forward, smiling" },
  { id: "left_profile", label: "Left Profile", description: "90° left side view" },
  { id: "right_profile", label: "Right Profile", description: "90° right side view" },
  { id: "three_quarter_left", label: "Three-Quarter Left", description: "45° left angle" },
  { id: "three_quarter_right", label: "Three-Quarter Right", description: "45° right angle" },
  { id: "closeup_eyes", label: "Closeup: Eyes", description: "Close-up of eye area" },
  { id: "closeup_nose", label: "Closeup: Nose", description: "Close-up of nose area" },
  { id: "closeup_mouth", label: "Closeup: Mouth", description: "Close-up of mouth area" },
  { id: "closeup_left_ear", label: "Closeup: Left Ear", description: "Close-up of left ear" },
  { id: "closeup_right_ear", label: "Closeup: Right Ear", description: "Close-up of right ear" },
];

export default function NewAdvancedReading() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "unknown">("unknown");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [uploadedImages, setUploadedImages] = useState<Record<string, string>>({});
  const [currentReadingId, setCurrentReadingId] = useState<string | null>(null);

  // Redirect non-admin users
  if (!loading && (!isAuthenticated || user?.role !== "admin")) {
    setLocation("/");
    return null;
  }

  const createMutation = trpc.advancedFaceReading.createReading.useMutation({
    onSuccess: (data) => {
      setCurrentReadingId(data.readingId);
      setStep(2);
      toast.success("Advanced reading created! Now upload 11 photos.");
    },
    onError: (error) => {
      toast.error(`Failed to create: ${error.message}`);
    },
  });

  const uploadMutation = trpc.advancedFaceReading.uploadImage.useMutation({
    onSuccess: (_, variables) => {
      setUploadedImages((prev) => ({ ...prev, [variables.imageType]: "uploaded" }));
      toast.success(`${variables.imageType} uploaded successfully`);
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const startAnalysisMutation = trpc.advancedFaceReading.startAnalysis.useMutation({
    onSuccess: () => {
      toast.success("Advanced analysis started! This will take 10-15 minutes. You can leave this page.");
      setTimeout(() => setLocation("/advanced-readings"), 2000);
    },
    onError: (error) => {
      toast.error(`Failed to start analysis: ${error.message}`);
    },
  });

  const handleCreateReading = () => {
    if (!name.trim()) {
      toast.error("Please enter a name");
      return;
    }
    createMutation.mutate({ name, gender, dateOfBirth });
  };

  const handleImageUpload = async (imageType: string, file: File) => {
    if (!currentReadingId) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      await uploadMutation.mutateAsync({
        readingId: currentReadingId,
        imageType: imageType as any,
        imageData,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleStartAnalysis = () => {
    if (!currentReadingId) return;
    const uploadedCount = Object.keys(uploadedImages).length;
    if (uploadedCount < 11) {
      toast.error(`Please upload all 11 photos. Currently uploaded: ${uploadedCount}/11`);
      return;
    }
    startAnalysisMutation.mutate({ readingId: currentReadingId });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/advanced-readings">
              <a className="text-sm text-gray-300 hover:text-orange-500 transition-colors">
                ← Back to Advanced Readings
              </a>
            </Link>
            <div className="flex items-center gap-3">
              <img src={APP_LOGO} alt="Logo" className="w-8 h-8" />
              <span className="text-xl font-bold text-orange-500">New Advanced Reading</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 py-12">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className={`flex items-center gap-2 ${step >= 1 ? "text-purple-400" : "text-gray-500"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-purple-500" : "bg-gray-700"}`}>
              {step > 1 ? <Check className="w-5 h-5" /> : "1"}
            </div>
            <span className="text-sm font-medium">Basic Info</span>
          </div>
          <div className="w-16 h-0.5 bg-gray-700" />
          <div className={`flex items-center gap-2 ${step >= 2 ? "text-purple-400" : "text-gray-500"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-purple-500" : "bg-gray-700"}`}>
              {step > 2 ? <Check className="w-5 h-5" /> : "2"}
            </div>
            <span className="text-sm font-medium">Upload Photos</span>
          </div>
          <div className="w-16 h-0.5 bg-gray-700" />
          <div className={`flex items-center gap-2 ${step >= 3 ? "text-purple-400" : "text-gray-500"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-purple-500" : "bg-gray-700"}`}>
              3
            </div>
            <span className="text-sm font-medium">Start Analysis</span>
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <Card className="p-8 bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30">
            <div className="text-center mb-8">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-400" />
              <h2 className="text-2xl font-bold text-white mb-2">Basic Information</h2>
              <p className="text-gray-300">Tell us about yourself to personalize the reading</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-white">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="mt-2 bg-white/10 border-white/20 text-white"
                />
              </div>

              <div>
                <Label className="text-white mb-3 block">Gender</Label>
                <RadioGroup value={gender} onValueChange={(v) => setGender(v as any)}>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male" className="text-white cursor-pointer">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female" className="text-white cursor-pointer">Female</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unknown" id="unknown" />
                      <Label htmlFor="unknown" className="text-white cursor-pointer">Prefer not to say</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="dob" className="text-white">Date of Birth (Optional)</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="mt-2 bg-white/10 border-white/20 text-white"
                />
                <p className="text-sm text-gray-400 mt-1">Helps with age-specific predictions</p>
              </div>

              <Button
                onClick={handleCreateReading}
                disabled={createMutation.isPending}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                size="lg"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Continue to Photo Upload"
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Upload Photos */}
        {step === 2 && (
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30">
              <h2 className="text-2xl font-bold text-white mb-2">Upload 11 Photos</h2>
              <p className="text-gray-300 mb-4">
                Upload all required photos for comprehensive advanced analysis
              </p>
              <div className="flex items-center gap-2 text-sm text-purple-300">
                <span className="font-bold">{Object.keys(uploadedImages).length}/11</span>
                <span>photos uploaded</span>
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              {IMAGE_TYPES.map((type) => (
                <Card
                  key={type.id}
                  className={`p-4 ${
                    uploadedImages[type.id]
                      ? "bg-green-900/20 border-green-500/30"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-white">{type.label}</h3>
                      <p className="text-sm text-gray-400">{type.description}</p>
                    </div>
                    {uploadedImages[type.id] && (
                      <Check className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(type.id, file);
                    }}
                    disabled={uploadMutation.isPending}
                    className="mt-2 bg-white/10 border-white/20 text-white"
                  />
                </Card>
              ))}
            </div>

            <Button
              onClick={handleStartAnalysis}
              disabled={Object.keys(uploadedImages).length < 11 || startAnalysisMutation.isPending}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              size="lg"
            >
              {startAnalysisMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Starting Analysis...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Advanced Analysis (10-15 min)
                </>
              )}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

