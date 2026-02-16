import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Scan, 
  Camera, 
  Upload, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  Pill,
  Edit3,
  Save,
  RotateCcw,
  Package
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MedicineInfo {
  name: string;
  manufacturer: string;
  expiryDate: string;
  batchNumber: string;
  strength: string;
  isExpired: boolean;
  recommendation: 'keep' | 'donate' | 'dispose';
  reasoning: string;
}

export default function StripScanner() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [medicineInfo, setMedicineInfo] = useState<MedicineInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<MedicineInfo>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      setMedicineInfo(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedImage(file);
      setMedicineInfo(null);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startScanning = async () => {
    if (!uploadedImage) return;

    setIsScanning(true);
    setScanProgress(0);

    try {
      // Create FormData for image upload
      const formData = new FormData();
      formData.append('stripImage', uploadedImage);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 20;
        });
      }, 400);

      // Call real OCR API
      const response = await fetch('/api/ocr/scan', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      clearInterval(progressInterval);
      setScanProgress(100);

      if (data.success) {
        setMedicineInfo(data.data);
        setEditForm(data.data);
      } else {
        throw new Error(data.message || 'OCR scanning failed');
      }

      setIsScanning(false);
    } catch (error) {
      console.error('OCR scanning error:', error);

      // Fallback to mock data if API fails
      const fallbackResult: MedicineInfo = {
        name: "Unable to read text clearly",
        manufacturer: "Please check manually",
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        batchNumber: "Unknown",
        strength: "Please check packaging",
        isExpired: false,
        recommendation: 'dispose',
        reasoning: "OCR scanning failed. Please check the expiry date manually and dispose if expired. Try taking a clearer photo in good lighting."
      };

      setMedicineInfo(fallbackResult);
      setEditForm(fallbackResult);
      setIsScanning(false);
    }
  };

  const resetScanner = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setMedicineInfo(null);
    setIsScanning(false);
    setScanProgress(0);
    setIsEditing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const saveEdits = async () => {
    if (medicineInfo && editForm) {
      try {
        const updatedInfo = { ...medicineInfo, ...editForm };

        // Call API to get updated recommendation
        const response = await fetch('/api/ocr/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ medicineInfo: updatedInfo })
        });

        const data = await response.json();

        if (data.success) {
          setMedicineInfo(data.data);
        } else {
          // Fallback to local calculation
          const today = new Date();
          const expiry = new Date(updatedInfo.expiryDate);
          updatedInfo.isExpired = expiry < today;

          if (updatedInfo.isExpired) {
            updatedInfo.recommendation = 'dispose';
            updatedInfo.reasoning = "Medicine has expired. Please dispose of it safely according to local guidelines.";
          } else {
            updatedInfo.recommendation = 'donate';
            updatedInfo.reasoning = "Medicine is within expiry date and in good condition. Consider donating to local pharmacy or healthcare center.";
          }

          setMedicineInfo(updatedInfo);
        }

        setIsEditing(false);
      } catch (error) {
        console.error('Update error:', error);
        // Fallback to local update
        const updatedInfo = { ...medicineInfo, ...editForm };
        const today = new Date();
        const expiry = new Date(updatedInfo.expiryDate);
        updatedInfo.isExpired = expiry < today;

        setMedicineInfo(updatedInfo);
        setIsEditing(false);
      }
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'keep': return 'bg-info/10 text-info border-info/20';
      case 'donate': return 'bg-success/10 text-success border-success/20';
      case 'dispose': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'keep': return Package;
      case 'donate': return CheckCircle;
      case 'dispose': return AlertTriangle;
      default: return Pill;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full mr-3">
              <Scan className="h-8 w-8 text-primary" />
            </div>
            <Badge variant="secondary">OCR Technology</Badge>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Medicine Strip Scanner
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Scan medicine strips and packages to extract information like expiry dates, dosage, and batch numbers using AI-powered OCR technology.
          </p>
        </div>

        {!medicineInfo && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="h-5 w-5 mr-2 text-primary" />
                Upload Medicine Strip Image
              </CardTitle>
              <CardDescription>
                Supports JPG, PNG, WEBP images. Best results with clear, well-lit photos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                  uploadedImage ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                )}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {uploadedImage && imagePreview ? (
                  <div className="space-y-4">
                    <div className="max-w-md mx-auto">
                      <img 
                        src={imagePreview} 
                        alt="Medicine strip preview" 
                        className="w-full h-auto rounded-lg border"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{uploadedImage.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedImage.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={startScanning} disabled={isScanning}>
                        {isScanning ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Scanning...
                          </>
                        ) : (
                          <>
                            <Scan className="h-4 w-4 mr-2" />
                            Start OCR Scan
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={resetScanner}>
                        Choose Different Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center space-x-4">
                      <Camera className="h-12 w-12 text-muted-foreground" />
                      <Scan className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-foreground mb-2">
                        Drop your image here or click to browse
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Take a clear photo of medicine strip or package
                      </p>
                    </div>
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Image
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {isScanning && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Processing image with OCR...</span>
                    <span className="text-primary font-medium">{scanProgress}%</span>
                  </div>
                  <Progress value={scanProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    Extracting text and analyzing medicine information
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* OCR Results */}
        {medicineInfo && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Scan Results</h2>
              <div className="flex gap-2">
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Info
                  </Button>
                )}
                <Button variant="outline" onClick={resetScanner}>
                  Scan New Strip
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Medicine Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Pill className="h-5 w-5 mr-2 text-primary" />
                    Medicine Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Medicine Name</Label>
                        <Input
                          id="name"
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="manufacturer">Manufacturer</Label>
                        <Input
                          id="manufacturer"
                          value={editForm.manufacturer || ''}
                          onChange={(e) => setEditForm({...editForm, manufacturer: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="strength">Strength</Label>
                        <Input
                          id="strength"
                          value={editForm.strength || ''}
                          onChange={(e) => setEditForm({...editForm, strength: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          type="date"
                          value={editForm.expiryDate || ''}
                          onChange={(e) => setEditForm({...editForm, expiryDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="batchNumber">Batch Number</Label>
                        <Input
                          id="batchNumber"
                          value={editForm.batchNumber || ''}
                          onChange={(e) => setEditForm({...editForm, batchNumber: e.target.value})}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={saveEdits} size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Medicine Name</Label>
                        <p className="text-lg font-semibold text-foreground">{medicineInfo.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Manufacturer</Label>
                        <p className="text-foreground">{medicineInfo.manufacturer}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Strength</Label>
                        <p className="text-foreground">{medicineInfo.strength}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Expiry Date</Label>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <p className={cn(
                            "font-medium",
                            medicineInfo.isExpired ? "text-destructive" : "text-success"
                          )}>
                            {medicineInfo.expiryDate}
                          </p>
                          {medicineInfo.isExpired && (
                            <Badge variant="destructive" className="text-xs">Expired</Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Batch Number</Label>
                        <p className="text-foreground font-mono">{medicineInfo.batchNumber}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recommendation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {(() => {
                      const Icon = getRecommendationIcon(medicineInfo.recommendation);
                      return <Icon className="h-5 w-5 mr-2 text-primary" />;
                    })()}
                    AI Recommendation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={cn(
                    "rounded-lg p-4 border",
                    getRecommendationColor(medicineInfo.recommendation)
                  )}>
                    <div className="flex items-center space-x-2 mb-3">
                      {(() => {
                        const Icon = getRecommendationIcon(medicineInfo.recommendation);
                        return <Icon className="h-5 w-5" />;
                      })()}
                      <span className="font-semibold capitalize">
                        {medicineInfo.recommendation === 'dispose' ? 'Dispose Safely' : 
                         medicineInfo.recommendation === 'donate' ? 'Consider Donating' : 'Keep for Use'}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">
                      {medicineInfo.reasoning}
                    </p>
                  </div>

                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium text-foreground">Next Steps:</h4>
                    {medicineInfo.recommendation === 'dispose' && (
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Seal in original packaging</li>
                        <li>• Take to pharmacy disposal program</li>
                        <li>• Do not flush or throw in regular trash</li>
                      </ul>
                    )}
                    {medicineInfo.recommendation === 'donate' && (
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Contact local pharmacy donation programs</li>
                        <li>• Check with healthcare centers or NGOs</li>
                        <li>• Ensure unopened and unexpired</li>
                      </ul>
                    )}
                    {medicineInfo.recommendation === 'keep' && (
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Store in cool, dry place</li>
                        <li>• Keep in original packaging</li>
                        <li>• Check expiry before use</li>
                      </ul>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                OCR results may not be 100% accurate. Please verify the information and consult healthcare professionals for medical advice.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
}
