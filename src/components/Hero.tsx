import { ArrowRight, Sparkles, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
const Hero = () => {
  const navigate = useNavigate();
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero pt-16">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-glass backdrop-blur-md border border-primary-foreground/10 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-gray-950">AI-Powered Financial Revolution</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150 text-neutral-950">
            Zenith One-Click
            <br />
            <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
              Powered By AI
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-foreground mb-12 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            Eliminate repetitive form-filling with AI. Get pre-qualified for credit cards, checking accounts, and loans
            instantly. No paperwork, no waiting, just intelligent financial services tailored to you.
          </p>

          <div className="flex justify-center items-center mb-16 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
            <Button size="lg" onClick={() => navigate("/onboarding-choice")} className="group bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-8 text-2xl font-bold rounded-2xl shadow-glow transition-all hover:scale-105">
              One-Click Onboarding
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-700">
            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-glass backdrop-blur-md border border-primary-foreground/10">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">Instant Approval</h3>
              <p className="text-sm text-foreground/70">AI processes applications in seconds, not days</p>
            </div>

            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-glass backdrop-blur-md border border-primary-foreground/10">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">Bank-Level Security</h3>
              <p className="text-sm text-foreground/70">AI-powered ID verification with encrypted credential storage</p>
            </div>

            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-glass backdrop-blur-md border border-primary-foreground/10">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">Personalized Offers</h3>
              <p className="text-sm text-foreground/70">Products tailored to your unique financial profile</p>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;
