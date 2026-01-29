import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { login } from "../lib/utils";
import { Phone, Check } from "lucide-react";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API
    setTimeout(() => {
      login();
      navigate("/onboarding");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex">
       {/* Left Side - Visual */}
       <div className="hidden lg:flex w-1/2 bg-blue-600 text-white p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900"></div>
          
          {/* Decorative circles */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight mb-12">
              <div className="bg-white text-blue-600 p-1.5 rounded-lg">
                <Phone className="h-5 w-5" />
              </div>
              <span>NeverMissLead</span>
            </Link>
            
            <h2 className="text-3xl font-bold mb-6">Start your 100-minute free trial today.</h2>
            <ul className="space-y-4 text-blue-100">
               {[
                 "Setup in 5 minutes",
                 "No credit card required",
                 "Cancel anytime",
                 "24/7 AI Receptionist"
               ].map(item => (
                 <li key={item} className="flex items-center gap-3">
                   <div className="bg-blue-500/50 p-1 rounded-full"><Check className="h-3 w-3" /></div>
                   {item}
                 </li>
               ))}
            </ul>
          </div>
       </div>

       {/* Right Side - Form */}
       <div className="flex-1 flex items-center justify-center p-4 bg-slate-50">
        <Card className="w-full max-w-md shadow-xl border-none">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription>Enter your email below to create your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="password">Password</label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  Must be at least 6 characters
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Get Started"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link to="/sign-in" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
            <p className="px-8 text-center text-xs text-muted-foreground mt-4">
              By clicking continue, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}