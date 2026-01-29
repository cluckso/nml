import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { login } from "../lib/utils";
import { Phone } from "lucide-react";

export default function SignInPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API
    setTimeout(() => {
      login();
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex">
       {/* Left Side - Visual */}
       <div className="hidden lg:flex w-1/2 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20"></div>
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight mb-8">
              <div className="bg-white text-slate-900 p-1.5 rounded-lg">
                <Phone className="h-5 w-5" />
              </div>
              <span>NeverMissLead</span>
            </Link>
            <h2 className="text-4xl font-bold leading-tight mb-4">
              "We recovered 12 calls in our first week."
            </h2>
            <p className="text-slate-400 text-lg">
              — Sarah Jenkins, Sparkle Cleaners
            </p>
          </div>
          <div className="relative z-10 text-sm text-slate-500">
            © 2024 NeverMissLead AI
          </div>
       </div>

       {/* Right Side - Form */}
       <div className="flex-1 flex items-center justify-center p-4 bg-slate-50">
        <Card className="w-full max-w-md shadow-xl border-none">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
            <CardDescription>Enter your email below to login to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                 <div className="flex items-center justify-between">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">Password</label>
                  <a href="#" className="text-sm text-primary hover:underline">Forgot password?</a>
                 </div>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/sign-up" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}