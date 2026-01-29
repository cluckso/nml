import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Phone, Clock, AlertTriangle, Play, Settings, History, BarChart3, ArrowUpRight } from "lucide-react";

export default function DashboardPage() {
  // Mock Data
  const recentCalls = [
    { id: 1, name: "John Doe", number: "(555) 123-4567", time: "2 mins ago", status: "Lead", emergency: false },
    { id: 2, name: "Sarah Smith", number: "(555) 987-6543", time: "1 hour ago", status: "Emergency", emergency: true },
    { id: 3, name: "Unknown", number: "(555) 000-1111", time: "3 hours ago", status: "Spam", emergency: false },
  ];

  const businessName = "Acme Plumbing Co.";

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {businessName}</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline">
             <Settings className="mr-2 h-4 w-4" /> Settings
           </Button>
           <Button>
             <ArrowUpRight className="mr-2 h-4 w-4" /> View Live Agent
           </Button>
        </div>
      </div>

      {/* Trial Banner */}
      <Card className="mb-8 border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20 shadow-none">
        <CardContent className="pt-6 flex items-start gap-4">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-amber-900">Trial Status</h4>
            <p className="text-sm text-amber-800">
              You have <span className="font-bold">85</span> of 100 minutes remaining.{" "}
              <Link to="/pricing" className="underline hover:text-amber-950">Upgrade now</Link> to unlock full features.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Calls (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">142</span>
              <span className="text-sm text-green-600 flex items-center">
                +12% <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Minutes Used</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">482</span>
              <span className="text-sm text-muted-foreground">/ 500</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 mt-2 rounded-full overflow-hidden">
               <div className="bg-indigo-500 h-full w-[80%]"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Emergencies Detected</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">3</span>
              <span className="text-sm text-red-600 font-medium">Action Required</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Setup Card */}
      <Card className="mb-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-none shadow-xl">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <div className="bg-green-500 h-3 w-3 rounded-full animate-pulse"></div>
                AI Agent Active
              </h3>
              <p className="text-slate-300">
                Your AI is currently answering calls on <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white">(555) 123-4567</span>.
              </p>
            </div>
            <div className="flex gap-4">
              <Button variant="secondary" className="gap-2">
                <Play className="h-4 w-4" /> Test Call
              </Button>
              <Button variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10">
                Configure Agent
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Calls */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          Recent Activity
        </h2>
        <Button variant="ghost" size="sm">View All</Button>
      </div>

      <Card>
        <div className="divide-y">
          {recentCalls.map((call) => (
            <div key={call.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${call.emergency ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                  {call.emergency ? <AlertTriangle className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{call.name}</p>
                  <p className="text-sm text-muted-foreground">{call.number} • {call.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                   call.emergency 
                    ? "bg-red-100 text-red-700"
                    : call.status === "Spam" 
                    ? "bg-gray-100 text-gray-700" 
                    : "bg-green-100 text-green-700"
                 }`}>
                   {call.status}
                 </span>
                 <Button variant="ghost" size="icon" className="h-8 w-8">
                   <ArrowUpRight className="h-4 w-4" />
                 </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}