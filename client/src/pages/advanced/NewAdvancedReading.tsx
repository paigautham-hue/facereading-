/**
 * New Advanced Reading Page (Admin-Only)
 * 
 * Create a new advanced reading with photo upload
 */

import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, Upload, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function NewAdvancedReading() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [images, setImages] = useState<{ [key: string]: File }>({});
  const [uploading, setUploading] = useState(false);

  const createMutation = trpc.advancedReading.create.useMutation();
  const uploadImageMutation = trpc.advancedReading.uploadImage.useMutation();
  const startAnalysisMutation = trpc.advancedReading.startAnalysis.useMutation();

  const imageTypes = [
    "frontal_neutral",
    "frontal_smile",
    "left_profile",
    "right_profile",
    "closeup_eyes",
    "closeup_hands",
  ];

  const handleImageSelect = (type: string, file: File | null) => {
    if (file) {
      setImages((prev) => ({ ...prev, [type]: file }));
    } else {
      const newImages = { ...images };
      delete newImages[type];
      setImages(newImages);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    if (Object.keys(images).length === 0) {
      toast.error("Please upload at least one photo");
      return;
    }

    setUploading(true);

    try {
      // Create reading
      const reading = await createMutation.mutateAsync({
        name,
        gender,
        dateOfBirth: dateOfBirth || undefined,
      });

      // Upload images
      for (const [type, file] of Object.entries(images)) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]);
          };
          reader.readAsDataURL(file);
        });

        await uploadImageMutation.mutateAsync({
          readingId: reading.id,
          imageType: type,
          imageData: base64,
          mimeType: file.type,
        });
      }

      // Start analysis
      await startAnalysisMutation.mutateAsync({ readingId: reading.id });

      toast.success("Advanced reading created! Analysis started.");
      setLocation(`/advanced/${reading.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create reading");
      setUploading(false);
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Advanced readings are only available to administrators.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-orange-500 flex items-center gap-2">
            <Sparkles className="h-8 w-8" />
            New Advanced Reading
          </h1>
          <p className="text-slate-400 mt-2">
            Create an enhanced reading with mole analysis, compatibility, and life timeline
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter name"
                  required
                />
              </div>

              <div>
                <Label>Gender</Label>
                <RadioGroup value={gender} onValueChange={(v: any) => setGender(v)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="dob">Date of Birth (Optional)</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Upload Photos</CardTitle>
              <CardDescription>
                Upload photos for comprehensive analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {imageTypes.map((type) => (
                  <div key={type} className="border border-dashed rounded-lg p-4">
                    <Label className="text-sm capitalize mb-2 block">
                      {type.replace(/_/g, " ")}
                    </Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageSelect(type, e.target.files?.[0] || null)
                      }
                    />
                    {images[type] && (
                      <p className="text-xs text-green-500 mt-1">
                        ✓ {images[type].name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/advanced")}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Create & Analyze
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

