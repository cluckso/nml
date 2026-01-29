import React from "react";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/Home";
import PricingPage from "./pages/Pricing";
import SignInPage from "./pages/SignIn";
import SignUpPage from "./pages/SignUp";
import DashboardPage from "./pages/Dashboard";
import OnboardingPage from "./pages/Onboarding";

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/pricing" element={<Layout><PricingPage /></Layout>} />
        <Route path="/sign-in" element={<Layout hideNav><SignInPage /></Layout>} />
        <Route path="/sign-up" element={<Layout hideNav><SignUpPage /></Layout>} />
        <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
        <Route path="/onboarding" element={<Layout><OnboardingPage /></Layout>} />
      </Routes>
    </HashRouter>
  );
}