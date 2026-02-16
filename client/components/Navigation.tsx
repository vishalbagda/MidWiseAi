import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  NavigationMenuList, 
  NavigationMenuTrigger 
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  Stethoscope, 
  FileText, 
  Scan, 
  Recycle, 
  Pill,
  Shield,
  Users,
  Phone
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const features = [
    {
      title: "Prescription Analyzer",
      href: "/prescription-analyzer",
      description: "Upload and analyze prescriptions and lab reports",
      icon: FileText
    },
    {
      title: "Strip Scanner",
      href: "/strip-scanner", 
      description: "Scan medicine strips with OCR technology",
      icon: Scan
    },
    {
      title: "Donate/Dispose",
      href: "/donate-dispose",
      description: "Responsible medicine management guidance",
      icon: Recycle
    },
    {
      title: "OTC Suggestions",
      href: "/otc-suggestions",
      description: "AI-powered over-the-counter recommendations",
      icon: Pill
    }
  ];

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary p-2 rounded-lg">
              <Stethoscope className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xl font-bold text-foreground">MedWise AI</span>
              <Badge variant="secondary" className="ml-2 text-xs">Beta</Badge>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-foreground">Features</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {features.map((feature) => (
                        <NavigationMenuLink key={feature.href} asChild>
                          <Link
                            to={feature.href}
                            className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                              isActivePath(feature.href) && "bg-accent text-accent-foreground"
                            )}
                          >
                            <div className="flex items-center space-x-2">
                              <feature.icon className="h-4 w-4" />
                              <div className="text-sm font-medium leading-none">
                                {feature.title}
                              </div>
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {feature.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link 
                    to="/about" 
                    className={cn(
                      "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                      isActivePath("/about") && "bg-accent text-accent-foreground"
                    )}
                  >
                    About
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link 
                    to="/contact" 
                    className={cn(
                      "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                      isActivePath("/contact") && "bg-accent text-accent-foreground"
                    )}
                  >
                    Contact
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <div className="flex items-center space-x-2">
              <Button asChild variant="ghost" size="sm">
                <Link to="/prescription-analyzer">Try Now</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/prescription-analyzer">Get Started</Link>
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Features</h3>
                    {features.map((feature) => (
                      <Link
                        key={feature.href}
                        to={feature.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-start space-x-3 p-3 rounded-md transition-colors hover:bg-accent",
                          isActivePath(feature.href) && "bg-accent"
                        )}
                      >
                        <feature.icon className="h-5 w-5 mt-0.5 text-primary" />
                        <div>
                          <div className="font-medium text-sm">{feature.title}</div>
                          <div className="text-xs text-muted-foreground">{feature.description}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4 space-y-2">
                    <Link 
                      to="/about" 
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "block px-3 py-2 rounded-md transition-colors hover:bg-accent",
                        isActivePath("/about") && "bg-accent"
                      )}
                    >
                      About
                    </Link>
                    <Link 
                      to="/contact" 
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "block px-3 py-2 rounded-md transition-colors hover:bg-accent",
                        isActivePath("/contact") && "bg-accent"
                      )}
                    >
                      Contact
                    </Link>
                  </div>
                  
                  <div className="border-t pt-4 space-y-2">
                    <Button asChild className="w-full" onClick={() => setIsOpen(false)}>
                      <Link to="/prescription-analyzer">Get Started</Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
