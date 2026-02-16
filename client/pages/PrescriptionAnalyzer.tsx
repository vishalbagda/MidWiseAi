import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  FileText, 
  Image, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  Info,
  Pill,
  Clock,
  Users,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalysisResult {
  summary: string;
  medications: Array<{
    name: string;
    purpose: string;
    dosage: string;
    frequency: string;
    instructions: string;
    sideEffects: string[];
    warnings: string[];
  }>;
  importantNotes: string[];
  disclaimer: string;
}

export default function PrescriptionAnalyzer() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setAnalysisResult(null);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setUploadedFile(file);
      setAnalysisResult(null);
    }
  };

  const startAnalysis = async () => {
    if (!uploadedFile) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('prescription', uploadedFile);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 500);

      // Call real API
      const response = await fetch('/api/prescription/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      if (data.success) {
        setAnalysisResult(data.data);
      } else {
        throw new Error(data.message || 'Analysis failed');
      }

      setIsAnalyzing(false);
    } catch (error) {
      console.error('Analysis error:', error);

      // Fallback to mock data if API fails
      const fallbackResult: AnalysisResult = {
        medications: [
          {
            name: "Analysis temporarily unavailable",
            purpose: "Please try again or consult your pharmacist",
            dosage: "As prescribed",
            frequency: "As directed",
            sideEffects: ["Contact support if this persists"],
            warnings: ["Always follow your doctor's instructions"]
          }
        ],
        summary: "We're experiencing technical difficulties with the analysis. Please try uploading your prescription again, or consult your healthcare provider for assistance.",
        keyPoints: [
          "Take medications exactly as prescribed",
          "Contact your pharmacist if you have questions",
          "Keep all medical appointments"
        ],
        disclaimer: "This AI analysis service is temporarily unavailable. Always consult healthcare professionals for medical advice."
      };

      setAnalysisResult(fallbackResult);
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setUploadedFile(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
    setAnalysisProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full mr-3">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <Badge variant="secondary">AI-Powered Analysis</Badge>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Prescription & Report Analyzer
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload your prescription or lab report and get AI-powered explanations in simple, understandable language.
          </p>
        </div>

        {!analysisResult && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2 text-primary" />
                Upload Your Document
              </CardTitle>
              <CardDescription>
                Supports PDF files and images (JPG, PNG). Maximum file size: 10MB
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                  uploadedFile ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                )}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {uploadedFile ? (
                  <div className="space-y-4">
                    <CheckCircle className="h-12 w-12 text-success mx-auto" />
                    <div>
                      <p className="font-medium text-foreground">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={startAnalysis} disabled={isAnalyzing}>
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4 mr-2" />
                            Analyze Document
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={resetAnalysis}>
                        Choose Different File
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center space-x-4">
                      <FileText className="h-12 w-12 text-muted-foreground" />
                      <Image className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-foreground mb-2">
                        Drop your file here or click to browse
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Upload prescriptions, lab reports, or medical documents
                      </p>
                    </div>
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {isAnalyzing && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Analyzing document...</span>
                    <span className="text-primary font-medium">{analysisProgress}%</span>
                  </div>
                  <Progress value={analysisProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    Processing your document with AI-powered medical analysis
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Analysis Results</h2>
              <Button variant="outline" onClick={resetAnalysis}>
                Analyze New Document
              </Button>
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                {analysisResult.disclaimer}
              </AlertDescription>
            </Alert>

            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="medications">Medications</TabsTrigger>
                <TabsTrigger value="instructions">Instructions</TabsTrigger>
                <TabsTrigger value="warnings">Important Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Info className="h-5 w-5 mr-2 text-info" />
                      Document Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {analysisResult.summary}
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-medium text-foreground">Important Health Notes:</h4>
                      <ul className="space-y-1">
                        {analysisResult.importantNotes.map((note, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="medications" className="space-y-4">
                {analysisResult.medications.map((med, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Pill className="h-5 w-5 mr-2 text-primary" />
                        {med.name}
                      </CardTitle>
                      <CardDescription>{med.purpose}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-foreground mb-2">Dosage & Frequency</h5>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Dose:</span> {med.dosage}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Frequency:</span> {med.frequency}
                            </p>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-foreground mb-2">Common Side Effects</h5>
                          <div className="flex flex-wrap gap-1">
                            {med.sideEffects.map((effect, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {effect}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="instructions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-warning" />
                      How to Take Your Medications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysisResult.medications.map((med, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h4 className="font-medium text-foreground mb-2">{med.name}</h4>
                          <div className="bg-muted p-3 rounded-md mb-3 text-sm">
                            <span className="font-semibold">Instructions: </span>
                            {med.instructions}
                          </div>
                          <div className="space-y-2">
                            <h5 className="text-xs font-semibold uppercase text-muted-foreground">Specific Warnings:</h5>
                            {med.warnings.map((warning, idx) => (
                              <div key={idx} className="flex items-start space-x-2">
                                <Info className="h-4 w-4 text-info mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-muted-foreground">{warning}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="warnings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-warning" />
                      Important Safety Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Alert>
                        <Shield className="h-4 w-4" />
                        <AlertDescription>
                          Always take medications exactly as prescribed by your healthcare provider.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium text-foreground">Important Health Notes:</h4>
                        <ul className="space-y-2">
                          {analysisResult.importantNotes.map((note, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-muted-foreground">{note}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
