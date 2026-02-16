import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Chatbot from "@/components/Chatbot";
import { 
  FileText, 
  Scan, 
  Recycle, 
  Pill, 
  Upload, 
  Shield, 
  Languages, 
  Heart, 
  CheckCircle,
  ArrowRight,
  Stethoscope
} from "lucide-react";

export default function Index() {
  const features = [
    {
      icon: FileText,
      title: "Prescription Summarizer",
      description: "Upload prescriptions and get AI-powered explanations in simple language.",
      link: "/prescription-analyzer"
    },
    {
      icon: Scan,
      title: "Medicine Strip Scanner",
      description: "Scan medicine strips with OCR technology to extract expiry dates.",
      link: "/strip-scanner"
    },
    {
      icon: Recycle,
      title: "Donate or Dispose",
      description: "Guidance on safely disposing expired medicines or donating unused ones.",
      link: "/donate-dispose"
    },
    {
      icon: Pill,
      title: "OTC Suggestions",
      description: "AI-powered over-the-counter medicine recommendations for ailments.",
      link: "/otc-suggestions"
    }
  ];

  const benefits = [
    "Understand prescriptions in simple language",
    "Reduce medicine wastage and impact",
    "Safe disposal guidance for medicines",
    "Access basic health education",
    "Support for multiple languages"
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-24 text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-primary/10 p-3 rounded-full mr-3">
            <Stethoscope className="h-8 w-8 text-primary" />
          </div>
          <Badge variant="secondary" className="px-4 py-1">HealthTech • AI-Powered • Sustainable</Badge>
        </div>
        
        <h1 className="text-4xl lg:text-7xl font-bold text-foreground mb-8 leading-tight">
          Your Personal AI{" "}
          <span className="text-primary">
            Health Assistant
          </span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          MedWise AI helps you understand prescriptions, manage medicines responsibly, 
          and make informed healthcare decisions.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/prescription-analyzer">
            <Button size="lg" className="px-8 py-6 text-lg">
              Start Analyzing <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
            Learn More
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Comprehensive Solutions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              AI-powered tools making healthcare accessible and sustainable.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="bg-primary/10 p-4 rounded-2xl w-fit mb-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    {feature.description}
                  </p>
                  <Link to={feature.link}>
                    <Button variant="link" className="p-0 font-bold group">
                      Try it now <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>



      {/* AI Chatbot */}
      <Chatbot />
    </div>
  );
}
