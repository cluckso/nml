import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Phone, UserCheck, AlertTriangle, MessageSquare, Clock, Smile, CheckCircle2, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white pt-20 pb-32 lg:pt-32 lg:pb-40">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-900"></div>
        
        <div className="container relative mx-auto px-4 flex flex-col items-center text-center">
          <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-300 backdrop-blur-xl mb-8">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
            Now supporting multi-language intake
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 max-w-4xl leading-tight">
            Never Miss Another Call <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Even After Hours
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            AI-powered answering & intake built for local service businesses.
            Capture leads, book requests, and emergencies — without hiring staff.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md mx-auto">
            <Link to="/sign-up" className="w-full sm:w-auto">
              <Button size="lg" className="w-full text-lg h-14 bg-blue-600 hover:bg-blue-500 border-none shadow-xl shadow-blue-900/20">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/pricing" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full text-lg h-14 border-slate-700 bg-slate-800/50 text-white hover:bg-slate-800 hover:text-white backdrop-blur-sm">
                View Pricing
              </Button>
            </Link>
          </div>
          
          <div className="mt-12 flex items-center justify-center gap-8 text-slate-400 text-sm font-medium">
             <div className="flex items-center gap-2">
               <CheckCircle2 className="h-4 w-4 text-blue-400" /> No credit card required
             </div>
             <div className="flex items-center gap-2">
               <CheckCircle2 className="h-4 w-4 text-blue-400" /> 5-minute setup
             </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-24 -mt-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">Everything you need to grow</h2>
          <p className="text-lg text-muted-foreground">Powerful features that handle your calls so you can handle your business.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { 
              icon: Phone, 
              title: "Answers Every Call", 
              desc: "Never miss a lead, even when you're busy or closed. Works 24/7." 
            },
            { 
              icon: UserCheck, 
              title: "Captures Caller Info", 
              desc: "Automatically collects name, phone, address, and issue details." 
            },
            { 
              icon: AlertTriangle, 
              title: "Filters Emergencies", 
              desc: "Instantly flags urgent calls so you can prioritize what matters." 
            },
            { 
              icon: MessageSquare, 
              title: "Sends Summaries", 
              desc: "Get instant email and SMS notifications with all call details." 
            },
            { 
              icon: Clock, 
              title: "Works 24/7", 
              desc: "Never calls in sick. Always available to answer your customers." 
            },
            { 
              icon: Smile, 
              title: "Feels Human", 
              desc: "Professional, friendly AI that represents your business well." 
            }
          ].map((feature, i) => (
            <Card key={i} className="group hover:-translate-y-1 transition-all duration-300 border-none shadow-lg hover:shadow-xl bg-white/80 backdrop-blur ring-1 ring-slate-900/5">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Who It's For */}
      <section className="bg-slate-50 py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Built for Service Professionals</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { name: "Plumbers & HVAC", img: "https://images.unsplash.com/photo-1581578731117-104f8a3d3dfa?auto=format&fit=crop&q=80&w=400&h=300" },
              { name: "Auto Repair", img: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=400&h=300" },
              { name: "Childcare", img: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=400&h=300" },
              { name: "Electricians", img: "https://images.unsplash.com/photo-1621905476059-5f3460480932?auto=format&fit=crop&q=80&w=400&h=300" },
              { name: "Lawn & Snow", img: "https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&q=80&w=400&h=300" },
              { name: "Medical", img: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=400&h=300" },
              { name: "Wellness", img: "https://images.unsplash.com/photo-1544367563-12123d8959c9?auto=format&fit=crop&q=80&w=400&h=300" },
              { name: "All Services", img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=400&h=300" },
            ].map((item, i) => (
              <div key={i} className="group relative overflow-hidden rounded-2xl aspect-[4/3] cursor-pointer">
                <img 
                  src={item.img} 
                  alt={item.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center p-6">
                  <h3 className="font-semibold text-white text-lg">{item.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center bg-white rounded-3xl p-8 md:p-12 border shadow-2xl shadow-blue-900/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Why This Pays for Itself</h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            If you recover just one missed service call per month, the system covers its cost.
            Most customers recover 3–10 calls they were missing before.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-center max-w-2xl mx-auto">
            <div className="p-6 rounded-2xl bg-red-50 text-red-900">
              <p className="text-sm font-medium uppercase tracking-wide opacity-70 mb-2">Human Receptionist</p>
              <p className="text-3xl font-bold">$2,000+</p>
              <p className="text-sm opacity-70">per month</p>
            </div>
            <div className="p-6 rounded-2xl bg-green-50 text-green-900 ring-2 ring-green-500/20">
              <p className="text-sm font-medium uppercase tracking-wide opacity-70 mb-2">NeverMissLead AI</p>
              <p className="text-3xl font-bold">$99</p>
              <p className="text-sm opacity-70">per month</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-24 relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        
        <div className="container relative mx-auto px-4 text-center text-primary-foreground">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Start Capturing Every Call</h2>
          <p className="text-lg md:text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Get set up in under 10 minutes. No technical knowledge required.
          </p>
          <Link to="/sign-up">
            <Button size="lg" variant="secondary" className="h-14 px-8 text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}