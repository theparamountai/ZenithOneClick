import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Upload, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DocumentScanner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const accountType = location.state?.accountType || 'savings';
  
  const [isScanning, setIsScanning] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleScan = async () => {
    if (!selectedFile) {
      toast.error("Please select a document to scan");
      return;
    }

    setIsScanning(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      
      reader.onload = async () => {
        const base64Image = reader.result as string;

        const { data, error } = await supabase.functions.invoke('ocr-scanner', {
          body: { image: base64Image }
        });

        if (error) throw error;

        if (data.error) {
          throw new Error(data.error);
        }

        // Navigate to confirmation with extracted data and account type
        navigate('/account-confirmation', {
          state: {
            accountData: {
              ...data.data,
              accountType
            }
          }
        });

        toast.success("Document scanned successfully!");
      };

      reader.onerror = () => {
        throw new Error("Failed to read file");
      };

    } catch (error) {
      console.error('Scan error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to scan document");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pt-20">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/onboarding-choice')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Scan Your ID</h1>
            <p className="text-sm text-muted-foreground">Upload your NIN card or ID document</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto max-w-2xl p-4 pt-8">
        <Card className="p-8">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Document Verification</h2>
              <p className="text-muted-foreground">
                We'll extract your information from your ID document
              </p>
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              {previewUrl ? (
                <div className="space-y-4">
                  <img 
                    src={previewUrl} 
                    alt="Selected document" 
                    className="max-h-64 mx-auto rounded-lg"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                  >
                    Choose Different File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center gap-4 mb-4">
                    <Upload className="h-12 w-12 text-muted-foreground" />
                    <Camera className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a clear photo of your NIN card or ID document
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" asChild>
                      <span>Select File</span>
                    </Button>
                  </label>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleScan}
                disabled={!selectedFile || isScanning}
                className="flex-1"
              >
                {isScanning ? "Scanning..." : "Scan Document"}
              </Button>
            </div>

            {/* Info */}
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Account Type:</strong> {accountType.charAt(0).toUpperCase() + accountType.slice(1)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                We'll extract your Full Name, Gender, Address, and NIN Number from your document.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DocumentScanner;
