import { Brain, FileCheck, Shield, Zap } from "lucide-react";
const HowItWorks = () => {
  const steps = [{
    number: "01",
    icon: Brain,
    title: "AI Analyzes Your Profile",
    description: "Our intelligent system evaluates your financial footprint to understand your needs and pre-qualify you for relevant products.",
    features: ["Smart profiling", "Behavioral analysis", "Instant pre-qualification"]
  }, {
    number: "02",
    icon: FileCheck,
    title: "One-Form Application",
    description: "Fill out a single form with AI-assisted completion. Your information is shared across all products - no repetition needed.",
    features: ["Auto-fill technology", "Document scanning", "Natural language input"]
  }, {
    number: "03",
    icon: Shield,
    title: "Instant Verification",
    description: "Biometric authentication and AI-powered identity verification happen in real-time, ensuring security without delays.",
    features: ["Facial recognition", "Document validation", "Fraud detection"]
  }, {
    number: "04",
    icon: Zap,
    title: "Immediate Activation",
    description: "Get instant approval and immediate access. Digital cards provision to your wallet while physical ones ship.",
    features: ["Real-time decisions", "Instant funding", "Digital-first access"]
  }];
  return <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Four intelligent steps to transform your financial journey
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/60 to-primary/30 opacity-30"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => <div key={step.number} className="relative animate-in fade-in slide-in-from-bottom-6" style={{
            animationDelay: `${index * 150}ms`
          }}>
                {/* Number badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold shadow-glow z-10">
                  {step.number}
                </div>

                {/* Card */}
                <div className="bg-card rounded-2xl p-6 pt-12 border border-border hover:shadow-card transition-all duration-300 h-full">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-4 mx-auto">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-card-foreground mb-3 text-center">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 text-center">
                    {step.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2">
                    {step.features.map((feature, i) => <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        {feature}
                      </li>)}
                  </ul>
                </div>
              </div>)}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-block p-8 rounded-3xl bg-gradient-hero relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
            <h3 className="text-2xl md:text-3xl font-bold mb-4 relative z-10 text-gray-950">
              Ready to experience the future of banking?
            </h3>
            <p className="text-lg text-foreground mb-6 relative z-10">
              Join millions who've simplified their financial lives
            </p>
            <button onClick={() => window.location.href = '/auth'} className="relative z-10 px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-glow transition-all hover:scale-105">
              Get Started Now
            </button>
          </div>
        </div>
      </div>
    </section>;
};
export default HowItWorks;