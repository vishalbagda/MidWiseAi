import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Recycle, 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  CheckCircle, 
  AlertTriangle,
  Info,
  Shield,
  Package,
  Users,
  Loader2,
  ExternalLink,
  Heart,
  Map as MapIcon,
  Navigation as NavigationIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MedicineInfo {
  name: string;
  manufacturer?: string;
  expiryDate: string;
  batchNumber?: string;
  strength?: string;
  condition: 'unopened' | 'opened' | 'partial';
  medicineType: 'prescription' | 'otc' | 'controlled';
}

interface Recommendation {
  recommendation: 'keep' | 'donate' | 'dispose';
  reasoning: string;
  instructions: string[];
  resources: string[];
  warnings: string[];
}

interface DonationCenter {
  name: string;
  address: string;
  phone: string;
  distance: string;
  accepts: string[];
  hours: string;
  rating: number;
  verified: boolean;
}

interface DisposalGuidelines {
  guidelines: {
    general: string[];
    safeDisposal: string[];
    specificTypes: {
      controlled: string[];
      liquid: string[];
      inhalers: string[];
    };
    emergency: string[];
  };
  localResources: {
    name: string;
    type: string;
    description: string;
    contact: string;
  }[];
}

export default function DonateDispose() {
  const [activeTab, setActiveTab] = useState("assess");
  const [medicineInfo, setMedicineInfo] = useState<Partial<MedicineInfo>>({
    condition: 'unopened',
    medicineType: 'otc'
  });
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [donationCenters, setDonationCenters] = useState<DonationCenter[]>([]);
  const [location, setLocation] = useState("");
  const [selectedCenter, setSelectedCenter] = useState<DonationCenter | null>(null);
  const [disposalGuidelines, setDisposalGuidelines] = useState<DisposalGuidelines | null>(null);
  const [isGuidelinesLoading, setIsGuidelinesLoading] = useState(false);

  const getRecommendation = async () => {
    if (!medicineInfo.name || !medicineInfo.expiryDate) return;

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/donate-dispose/recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicineInfo })
      });

      const data = await response.json();
      
      if (data.success) {
        setRecommendation(data.data);
      } else {
        throw new Error(data.message || 'Failed to get recommendation');
      }
    } catch (error) {
      console.error('Recommendation error:', error);
      
      const today = new Date();
      const expiry = new Date(medicineInfo.expiryDate!);
      const isExpired = expiry < today;
      
      const fallback: Recommendation = {
        recommendation: isExpired ? 'dispose' : medicineInfo.condition === 'unopened' ? 'donate' : 'dispose',
        reasoning: isExpired 
          ? "Medicine has expired and should be disposed of safely."
          : medicineInfo.condition === 'unopened' 
            ? "Medicine is unexpired and unopened, suitable for donation."
            : "Opened medicines should be disposed of for safety reasons.",
        instructions: [
          "Check local disposal guidelines",
          "Contact pharmacy for take-back programs", 
          "Use FDA-approved disposal methods"
        ],
        resources: ["Local pharmacy", "Healthcare provider", "Municipal programs"],
        warnings: ["Never share prescription medicines", "Always dispose safely"]
      };
      
      setRecommendation(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const findDonationCenters = async () => {
    if (!location.trim()) {
      toast.error("Please enter a location");
      return;
    }
    setIsLoading(true);
    setDonationCenters([]);
    try {
      const response = await fetch(`/api/donate-dispose/donation-centers?location=${encodeURIComponent(location.trim())}&medicineType=${medicineInfo.medicineType}`);
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      
      if (data.success) {
        setDonationCenters(data.data.centers);
        if (data.data.total > 0) {
          toast.success(`Found ${data.data.total} donation centers in ${location}`);
        } else {
          toast.info(`No centers found in "${location}". Try Mumbai, Delhi, or Bangalore.`);
        }
      } else {
        toast.error(data.message || "Failed to find donation centers");
      }
    } catch (error) {
      console.error('Failed to find donation centers:', error);
      toast.error(error instanceof Error ? error.message : "Connection failed. Is the server running?");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDisposalGuidelines = async () => {
    setIsGuidelinesLoading(true);
    try {
      const response = await fetch('/api/donate-dispose/disposal-guidelines');
      const data = await response.json();
      
      if (data.success) {
        setDisposalGuidelines(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch disposal guidelines:', error);
    } finally {
      setIsGuidelinesLoading(false);
    }
  };

  const reportDonation = async (center: DonationCenter) => {
    try {
      const response = await fetch('/api/donate-dispose/report-donation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donationInfo: {
            medicine: medicineInfo,
            center: center,
            donatedAt: new Date().toISOString()
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Thank you for your donation! Your contribution helps others in need.');
      }
    } catch (error) {
      console.error('Failed to report donation:', error);
    }
  };

  const getRecommendationStyles = (rec: string) => {
    switch (rec) {
      case 'keep': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'donate': return 'bg-green-50 text-green-700 border-green-200';
      case 'dispose': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50';
    }
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'keep': return Package;
      case 'donate': return Heart;
      case 'dispose': return AlertTriangle;
      default: return Recycle;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-primary/10 p-3 rounded-full mr-3">
            <Recycle className="h-8 w-8 text-primary" />
          </div>
          <Badge variant="secondary" className="px-4 py-1">Medicine Sustainability</Badge>
        </div>
        <h1 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
          Medicine Donation & Disposal
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          AI-powered guidance on whether to donate unused medicines or how to safely 
          dispose of expired ones.
        </p>
      </div>

      <Tabs defaultValue="assess" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="assess">Assess Medicine</TabsTrigger>
          <TabsTrigger value="donate">Find Donation Centers</TabsTrigger>
          <TabsTrigger value="dispose" onClick={fetchDisposalGuidelines}>Disposal Guidelines</TabsTrigger>
        </TabsList>

        {/* Tab content: Assess Medicine */}
        <TabsContent value="assess" className="space-y-6 mt-0">
          {!recommendation ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2 text-primary" />
                  Medicine Information
                </CardTitle>
                <CardDescription>
                  Enter details about your medicine for an AI-powered recommendation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="med-name">Medicine Name *</Label>
                    <Input 
                      id="med-name"
                      placeholder="e.g. Paracetamol"
                      value={medicineInfo.name || ''}
                      onChange={(e) => setMedicineInfo({...medicineInfo, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="med-mfg">Manufacturer</Label>
                    <Input 
                      id="med-mfg"
                      placeholder="e.g. Generic Pharma"
                      value={medicineInfo.manufacturer || ''}
                      onChange={(e) => setMedicineInfo({...medicineInfo, manufacturer: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="med-expiry">Expiry Date *</Label>
                    <Input 
                      id="med-expiry"
                      type="date"
                      value={medicineInfo.expiryDate || ''}
                      onChange={(e) => setMedicineInfo({...medicineInfo, expiryDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="med-strength">Strength/Dosage</Label>
                    <Input 
                      id="med-strength"
                      placeholder="e.g. 500mg"
                      value={medicineInfo.strength || ''}
                      onChange={(e) => setMedicineInfo({...medicineInfo, strength: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label>Condition</Label>
                    <RadioGroup 
                      value={medicineInfo.condition} 
                      onValueChange={(val: any) => setMedicineInfo({...medicineInfo, condition: val})}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="unopened" id="c1" />
                        <Label htmlFor="c1" className="font-normal cursor-pointer">Unopened/Sealed</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="opened" id="c2" />
                        <Label htmlFor="c2" className="font-normal cursor-pointer">Opened but unused</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="partial" id="c3" />
                        <Label htmlFor="c3" className="font-normal cursor-pointer">Partially used</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label>Medicine Type</Label>
                    <RadioGroup 
                      value={medicineInfo.medicineType} 
                      onValueChange={(val: any) => setMedicineInfo({...medicineInfo, medicineType: val})}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="otc" id="t1" />
                        <Label htmlFor="t1" className="font-normal cursor-pointer">Over-the-counter (OTC)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="prescription" id="t2" />
                        <Label htmlFor="t2" className="font-normal cursor-pointer">Prescription Medicine</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="controlled" id="t3" />
                        <Label htmlFor="t3" className="font-normal cursor-pointer">Controlled Substance</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={getRecommendation}
                  disabled={!medicineInfo.name || !medicineInfo.expiryDate || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Recycle className="h-4 w-4 mr-2" />
                      Get Recommendation
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">AI Recommendation</h2>
                <Button variant="outline" onClick={() => setRecommendation(null)}>
                  Assess Another Medicine
                </Button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Card className={cn("md:col-span-2 overflow-hidden", getRecommendationStyles(recommendation.recommendation).split(' ')[2])}>
                  <div className={cn("p-6 flex items-center space-x-4", getRecommendationStyles(recommendation.recommendation))}>
                    <div className="bg-white/50 p-3 rounded-full">
                      {(() => {
                        const Icon = getRecommendationIcon(recommendation.recommendation);
                        return <Icon className="h-8 w-8" />;
                      })()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold uppercase tracking-wide">
                        {recommendation.recommendation === 'keep' ? 'Keep and Use' : 
                         recommendation.recommendation === 'donate' ? 'Recommended for Donation' : 'Safe Disposal Required'}
                      </h3>
                      <p className="opacity-90 font-medium">{recommendation.reasoning}</p>
                    </div>
                  </div>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-foreground mb-2 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          Steps & Instructions
                        </h4>
                        <ul className="space-y-2">
                          {recommendation.instructions.map((inst, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start">
                              <span className="bg-primary/10 text-primary h-5 w-5 rounded-full flex items-center justify-center text-[10px] mr-2 mt-0.5 mt-0.5">
                                {i + 1}
                              </span>
                              {inst}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center font-bold">
                        <Info className="h-4 w-4 mr-2 text-blue-600" />
                        Resources
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {recommendation.resources.map((res, i) => (
                          <li key={i} className="flex items-center">
                            <ExternalLink className="h-3 w-3 mr-2" />
                            {res}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Safety Warnings</AlertTitle>
                    <AlertDescription className="text-xs">
                      <ul className="list-disc pl-4 space-y-1 mt-2">
                        {recommendation.warnings.map((warn, i) => (
                          <li key={i}>{warn}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              {recommendation.recommendation === 'donate' && (
                <div className="bg-green-50 border border-green-100 rounded-lg p-6 text-center">
                  <Heart className="h-10 w-10 text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-green-800 mb-2">Help Others by Donating</h3>
                  <p className="text-green-700 text-sm mb-4">
                    Your unused, unexpired medicines can save lives. Find a donation center near you below.
                  </p>
                  <Button onClick={() => setActiveTab("donate")} className="bg-green-600 hover:bg-green-700">
                    Search Donation Centers
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Tab content: Find Donation Centers */}
        <TabsContent value="donate" className="space-y-6 mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary" />
                Find Verified Donation Centers
              </CardTitle>
              <CardDescription>
                Search by city or pincode to find organizations that accept medicine donations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter location (e.g. Mumbai, 400012)" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && findDonationCenters()}
                />
                <Button onClick={findDonationCenters} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                </Button>
              </div>

              {donationCenters.length > 0 && (
                <div className="grid md:grid-cols-2 gap-4 mt-8">
                  {donationCenters.map((center, i) => (
                    <Card key={i} className="overflow-hidden border-slate-200">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg flex items-center">
                              {center.name}
                              {center.verified && <CheckCircle className="h-4 w-4 ml-1 text-green-500" />}
                            </CardTitle>
                            <CardDescription className="flex items-center mt-1">
                              <Star className="h-3 w-3 mr-1 text-yellow-500 fill-current" />
                              {center.rating} • {center.distance}
                            </CardDescription>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => reportDonation(center)}>
                            <Badge variant="outline" className="text-[10px] cursor-pointer hover:bg-green-50">Log Donation</Badge>
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3 text-sm space-y-2">
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                          <span>{center.address}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                          <span>{center.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                          <span>{center.hours}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {center.accepts.map((type, j) => (
                            <Badge key={j} variant="secondary" className="text-[10px]">{type}</Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="bg-slate-50 pt-3 border-t">
                        <div className="grid grid-cols-2 w-full gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs h-8"
                            onClick={() => {
                              const query = encodeURIComponent(`${center.name} ${center.address}`);
                              window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                            }}
                          >
                            <MapIcon className="h-3 w-3 mr-1" /> Map
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs h-8"
                            onClick={() => {
                              const dest = encodeURIComponent(center.address);
                              window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, '_blank');
                            }}
                          >
                            <NavigationIcon className="h-3 w-3 mr-1" /> Navigate
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}

              {!isLoading && donationCenters.length === 0 && location && (
                <div className="text-center py-12 bg-slate-50 rounded-lg mt-8 border border-dashed">
                  <MapPin className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">No verified centers found in this location yet.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const query = encodeURIComponent(`medicine donation centers in ${location}`);
                      window.open(`https://www.google.com/maps/search/${query}`, '_blank');
                    }}
                  >
                    Search on Google Maps Instead
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab content: Disposal Guidelines */}
        <TabsContent value="dispose" className="space-y-6 mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Recycle className="h-5 w-5 mr-2 text-primary" />
                Disposal Guidelines
              </CardTitle>
              <CardDescription>
                How to safely dispose of medicines when donation is not an option.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isGuidelinesLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : disposalGuidelines ? (
                <div className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-bold text-lg mb-3 flex items-center">
                          <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                          Safe Disposal Steps
                        </h3>
                        <ul className="space-y-3">
                          {disposalGuidelines.guidelines.safeDisposal.map((step, i) => (
                            <li key={i} className="text-sm text-muted-foreground border-l-2 border-primary/20 pl-4 py-1">
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                        <h4 className="font-bold text-red-800 text-sm mb-2 flex items-center tracking-tight">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Emergency Home Disposal
                        </h4>
                        <ol className="list-decimal pl-5 space-y-2 text-xs text-red-700">
                          {disposalGuidelines.guidelines.emergency.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="font-bold text-lg mb-3 flex items-center tracking-tight">
                          <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                          Handling Specific Types
                        </h3>
                        <div className="space-y-4">
                          <div className="border rounded-md p-3">
                            <h4 className="font-semibold text-sm mb-1">Liquid Medicines</h4>
                            <p className="text-xs text-muted-foreground">{disposalGuidelines.guidelines.specificTypes.liquid.join(', ')}</p>
                          </div>
                          <div className="border rounded-md p-3">
                            <h4 className="font-semibold text-sm mb-1 text-red-600">Controlled Substances</h4>
                            <p className="text-xs text-muted-foreground">{disposalGuidelines.guidelines.specificTypes.controlled.join(', ')}</p>
                          </div>
                        </div>
                      </div>

                      {disposalGuidelines.localResources.length > 0 && (
                        <div>
                          <h3 className="font-bold text-lg mb-3 flex items-center">
                            <Info className="h-5 w-5 mr-2 text-blue-600" />
                            Local Drop-off Pincodes
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {disposalGuidelines.localResources.map((res, i) => (
                              <Badge key={i} variant="outline" className="bg-blue-50/50">
                                {res.name}: {res.contact}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Button onClick={fetchDisposalGuidelines}>Load Disposal Guidelines</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
