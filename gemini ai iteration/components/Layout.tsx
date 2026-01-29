import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Phone, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { isLoggedIn, logout } from "../lib/utils";

interface LayoutProps {
  children?: React.ReactNode;
  hideNav?: boolean;
}

export default function Layout({ children, hideNav = false }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const authed = isLoggedIn();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    { name: "Pricing", href: "/pricing" },
    { name: "About", href: "/#features" },
  ];

  if (hideNav) {
    return <main className="flex-1 min-h-screen bg-background">{children}</main>;
  }

  return (
    <div className="flex min-h-screen flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary tracking-tight">
            <div className="bg-primary text-white p-1.5 rounded-lg">
              <Phone className="h-5 w-5" />
            </div>
            <span>NeverMissLead</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {!authed && navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.href} 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </Link>
            ))}
            
            {authed ? (
              <>
                 <Link to="/dashboard">
                  <Button variant="ghost" className="gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                 </Link>
                 <Button variant="outline" size="sm" onClick={handleLogout}>
                   <LogOut className="h-4 w-4 mr-2" />
                   Log Out
                 </Button>
              </>
            ) : (
              <>
                <Link to="/sign-in">
                  <Button variant="ghost">Log In</Button>
                </Link>
                <Link to="/sign-up">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b bg-background p-4 space-y-4">
             {!authed && navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.href} 
                className="block text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
             {authed ? (
               <>
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
                </Link>
                <Button variant="outline" className="w-full" onClick={handleLogout}>Log Out</Button>
               </>
             ) : (
               <div className="flex flex-col gap-2 pt-2">
                  <Link to="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full">Log In</Button>
                  </Link>
                  <Link to="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">Get Started</Button>
                  </Link>
               </div>
             )}
          </div>
        )}
      </header>

      <main className="flex-1 relative">
        {children}
      </main>

      <footer className="border-t bg-muted/40 py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
           <div className="space-y-4">
             <div className="flex items-center gap-2 font-bold text-lg text-primary">
                <div className="bg-primary text-white p-1 rounded">
                  <Phone className="h-4 w-4" />
                </div>
                <span>NeverMissLead</span>
             </div>
             <p className="text-sm text-muted-foreground leading-relaxed">
               AI-powered call answering built specifically for local service businesses. Never miss a lead again.
             </p>
           </div>
           
           <div>
             <h4 className="font-semibold mb-4">Product</h4>
             <ul className="space-y-2 text-sm text-muted-foreground">
               <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
               <li><a href="#" className="hover:text-foreground">Features</a></li>
               <li><a href="#" className="hover:text-foreground">Demo</a></li>
             </ul>
           </div>

           <div>
             <h4 className="font-semibold mb-4">Company</h4>
             <ul className="space-y-2 text-sm text-muted-foreground">
               <li><a href="#" className="hover:text-foreground">About Us</a></li>
               <li><a href="#" className="hover:text-foreground">Blog</a></li>
               <li><a href="#" className="hover:text-foreground">Careers</a></li>
             </ul>
           </div>

           <div>
             <h4 className="font-semibold mb-4">Legal</h4>
             <ul className="space-y-2 text-sm text-muted-foreground">
               <li><Link to="#" className="hover:text-foreground">Privacy Policy</Link></li>
               <li><Link to="#" className="hover:text-foreground">Terms of Service</Link></li>
             </ul>
           </div>
        </div>
        <div className="container mx-auto px-4 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} NeverMissLead-AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}