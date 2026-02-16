import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import PrescriptionAnalyzer from "./pages/PrescriptionAnalyzer";
import StripScanner from "./pages/StripScanner";
import DonateDispose from "./pages/DonateDispose";
import OTCSuggestions from "./pages/OTCSuggestions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const PlaceholderPage = ({ title, description }: { title: string; description: string }) => (
  <div className="container mx-auto px-4 py-20 text-center">
    <h1 className="text-2xl font-bold mb-4">{title}</h1>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/prescription-analyzer" element={<PrescriptionAnalyzer />} />
              <Route path="/strip-scanner" element={<StripScanner />} />
              <Route path="/donate-dispose" element={<DonateDispose />} />
              <Route path="/otc-suggestions" element={<OTCSuggestions />} />
              <Route path="/about" element={<PlaceholderPage title="About MedWise AI" description="Learn more about our mission. Continue prompting to build this page." />} />
              <Route path="/contact" element={<PlaceholderPage title="Contact Us" description="Get in touch with our team. Continue prompting to build this page." />} />
              <Route path="/privacy" element={<PlaceholderPage title="Privacy Policy" description="Our privacy policy details. Continue prompting to build this page." />} />
              <Route path="/terms" element={<PlaceholderPage title="Terms of Service" description="Terms and conditions. Continue prompting to build this page." />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
