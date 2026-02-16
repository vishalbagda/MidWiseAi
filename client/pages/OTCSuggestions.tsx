import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Pill, 
  Search, 
  Loader2, 
  AlertTriangle,
  Info,
  ShieldCheck,
  Clock,
  Users,
  Stethoscope,
  Heart,
  Thermometer,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OTCRecommendation {
  medicine: string;
  type: string;
  dosage: string;
  duration: string;
  sideEffects: string[];
  warnings: string[];
}

interface OTCResponse {
  recommendations: OTCRecommendation[];
  generalAdvice: string;
  whenToSeeDoctor: string;
  disclaimer: string;
}

interface CategoryInfo {
  name: string;
  description: string;
  icon: string;
  medicines: string[];
}

export default function OTCSuggestions() {
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");
  const [allergies, setAllergies] = useState("");
  const [currentMeds, setCurrentMeds] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<OTCResponse | null>(null);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const getRecommendations = async () => {
    if (!symptoms.trim()) return;

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/otc/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: symptoms.trim(),
          age: age || undefined,
          allergies: allergies.split(',').map(a => a.trim()).filter(Boolean),
          currentMedications: currentMeds.split(',').map(m => m.trim()).filter(Boolean)
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setRecommendations(data.data);
      } else {
        throw new Error(data.message || 'Failed to get recommendations');
      }
    } catch (error) {
      console.error('OTC recommendations error:', error);
      
      // Fallback recommendations
      const fallback: OTCResponse = {
        recommendations: [
          {
            medicine: "Consult a pharmacist",
            type: "Professional guidance",
            dosage: "As recommended",
            duration: "As advised",
            sideEffects: ["Varies by medication"],
            warnings: ["Always read labels carefully"]
          }
        ],
        generalAdvice: "We're experiencing technical difficulties. Please consult a pharmacist or healthcare provider for personalized recommendations.",
        whenToSeeDoctor: "If symptoms persist, worsen, or you're unsure about any medication, consult a healthcare professional.",
        disclaimer: "This service is temporarily unavailable. Always consult healthcare professionals for medical advice."
      };
      
      setRecommendations(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/otc/categories');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data.categories);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const searchMedicines = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/otc/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data.results);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    searchMedicines(value);
  };

  // Load categories on component mount
  useState(() => {
    loadCategories();
  });

  const categoryIcons: { [key: string]: any } = {
    pill: Pill,
    stomach: Heart,
    thermometer: Thermometer,
    allergen: ShieldCheck,
    bandage: Shield,
    moon: Clock
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full mr-3">
              <Pill className="h-8 w-8 text-primary" />
            </div>
            <Badge variant="secondary">AI-Powered Recommendations</Badge>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            OTC Medicine Suggestions
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get AI-powered over-the-counter medicine recommendations for common symptoms and conditions.
          </p>
        </div>

        <Tabs defaultValue="symptoms" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="symptoms">Symptom Checker</TabsTrigger>
            <TabsTrigger value="search">Medicine Search</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="symptoms" className="space-y-6">
            {!recommendations && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Stethoscope className="h-5 w-5 mr-2 text-primary" />
                    Describe Your Symptoms
                  </CardTitle>
                  <CardDescription>
                    Tell us about your symptoms to get personalized OTC medicine recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="symptoms">Symptoms *</Label>
                    <Textarea
                      id="symptoms"
                      placeholder="Describe your symptoms (e.g., headache, nausea, runny nose, sore throat)"
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      className="min-h-20"
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="age">Age (optional)</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="Your age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="allergies">Known Allergies (optional)</Label>
                      <Input
                        id="allergies"
                        placeholder="Comma-separated (e.g., aspirin, ibuprofen)"
                        value={allergies}
                        onChange={(e) => setAllergies(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="currentMeds">Current Medications (optional)</Label>
                    <Input
                      id="currentMeds"
                      placeholder="Comma-separated list of medications you're taking"
                      value={currentMeds}
                      onChange={(e) => setCurrentMeds(e.target.value)}
                    />
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      This tool provides general information only. Always consult a healthcare professional for medical advice.
                    </AlertDescription>
                  </Alert>

                  <Button 
                    onClick={getRecommendations} 
                    disabled={!symptoms.trim() || isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Getting Recommendations...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Get OTC Recommendations
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {recommendations && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground">Recommendations</h2>
                  <Button variant="outline" onClick={() => setRecommendations(null)}>
                    New Search
                  </Button>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {recommendations.disclaimer}
                  </AlertDescription>
                </Alert>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Recommendations */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Suggested Medicines</h3>
                    {recommendations.recommendations.map((rec, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center text-lg">
                            <Pill className="h-5 w-5 mr-2 text-primary" />
                            {rec.medicine}
                          </CardTitle>
                          <Badge variant="secondary">{rec.type}</Badge>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Dosage</p>
                            <p className="text-foreground">{rec.dosage}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Duration</p>
                            <p className="text-foreground">{rec.duration}</p>
                          </div>
                          {rec.sideEffects.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-1">Common Side Effects</p>
                              <div className="flex flex-wrap gap-1">
                                {rec.sideEffects.map((effect, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {effect}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {rec.warnings.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-1">Warnings</p>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {rec.warnings.map((warning, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <AlertTriangle className="h-3 w-3 mr-1 mt-0.5 text-warning flex-shrink-0" />
                                    {warning}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Advice */}
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Info className="h-5 w-5 mr-2 text-info" />
                          General Advice
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                          {recommendations.generalAdvice}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Users className="h-5 w-5 mr-2 text-warning" />
                          When to See a Doctor
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                          {recommendations.whenToSeeDoctor}
                        </p>
                        <div className="mt-3 p-3 bg-warning/10 rounded-lg">
                          <p className="text-sm text-warning-foreground">
                            <strong>Seek immediate medical attention if:</strong>
                          </p>
                          <ul className="text-sm text-warning-foreground mt-1 space-y-1">
                            <li>• Symptoms are severe or worsening rapidly</li>
                            <li>• You have difficulty breathing</li>
                            <li>• High fever (over 103°F/39.4°C)</li>
                            <li>• Signs of allergic reaction</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Medicine Search</CardTitle>
                <CardDescription>
                  Search for specific over-the-counter medicines and their information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search medicines (e.g., paracetamol, ibuprofen)"
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {searchResults.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-medium text-foreground">Search Results</h3>
                      {searchResults.map((result, index) => (
                        <Card key={index}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-foreground">{result.name}</h4>
                              <Badge variant="outline">{result.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{result.description}</p>
                            <div className="space-y-1 text-sm">
                              <p><strong>Dosage:</strong> {result.dosage}</p>
                              {result.warnings.length > 0 && (
                                <div>
                                  <strong>Warnings:</strong>
                                  <ul className="ml-4 mt-1">
                                    {result.warnings.map((warning: string, idx: number) => (
                                      <li key={idx} className="text-muted-foreground">• {warning}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category, index) => {
                const IconComponent = categoryIcons[category.icon] || Pill;
                return (
                  <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-lg">
                        <div className="bg-primary/10 p-2 rounded-lg mr-3">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        {category.name}
                      </CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Common medicines:</p>
                        <div className="flex flex-wrap gap-1">
                          {category.medicines.slice(0, 3).map((medicine, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {medicine}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
