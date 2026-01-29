import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { login } from "../lib/utils";
import { Briefcase, MapPin, Phone, Building2, Check } from "lucide-react";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const industries = [
    "Plumbing", "HVAC", "Electrical", "Landscaping", "Auto Repair", "Medical Office", "Other"
  ];

  const handleFinish = () => {
    setLoading(true);
    setTimeout(() => {
      login();
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Let's set up your business</h1>
        <p className="text-muted-foreground">This helps our AI represent you correctly.</p>
        <div className="flex items-center justify-center gap-2 mt-6">
           <div className={`h-2 w-16 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-slate-200'}`}></div>
           <div className={`h-2 w-16 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-slate-200'}`}></div>
           <div className={`h-2 w-16 rounded-full transition-colors ${step >= 3 ? 'bg-primary' : 'bg-slate-200'}`}></div>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto shadow-lg">
        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle>What industry are you in?</CardTitle>
              <CardDescription>We'll optimize the AI conversation flow based on this.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {industries.map((ind) => (
                  <button 
                    key={ind} 
                    className="flex items-center gap-3 p-4 border rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left group"
                    onClick={() => setStep(2)}
                  >
                     <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                        <Briefcase className="h-4 w-4" />
                     </div>
                     <span className="font-medium">{ind}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
              <CardDescription>Where should we direct your customers?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Business Name</label>
                <div className="relative">
                   <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                   <Input placeholder="Acme Inc." className="pl-9" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Business Phone (to forward calls to)</label>
                <div className="relative">
                   <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                   <Input placeholder="(555) 123-4567" className="pl-9" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">City & State</label>
                <div className="relative">
                   <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                   <Input placeholder="Springfield, IL" className="pl-9" />
                </div>
              </div>
              <div className="pt-4 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)}>Continue</Button>
              </div>
            </CardContent>
          </>
        )}

        {step === 3 && (
          <div className="text-center py-8 px-6">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
               <Check className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">You're all set!</h2>
            <p className="text-muted-foreground mb-8">
              We've created a provisional AI agent for your business. 
              You can test it immediately on the next screen.
            </p>
            <Button size="lg" className="w-full" onClick={handleFinish} disabled={loading}>
              {loading ? "Finalizing setup..." : "Go to Dashboard"}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}