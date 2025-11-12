import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Dashboard from "@/components/Dashboard";
import HowItWorks from "@/components/HowItWorks";
import AIFeatures from "@/components/AIFeatures";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Dashboard />
      <HowItWorks />
      <AIFeatures />
    </div>
  );
};

export default Index;