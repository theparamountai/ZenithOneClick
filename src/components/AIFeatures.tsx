import { Brain, Eye, TrendingUp, Sparkles, Zap } from "lucide-react";

const AIFeatures = () => {
  const features = [
    {
      icon: Brain,
      title: "Generative AI Assistant",
      description: "Natural language processing understands your financial needs and generates personalized recommendations in real-time.",
      tech: "Large Language Models",
      color: "from-primary to-primary/80"
    },
    {
      icon: Eye,
      title: "Computer Vision Verification",
      description: "Advanced image recognition instantly verifies documents and identity with 99.9% accuracy, eliminating manual reviews.",
      tech: "Neural Networks",
      color: "from-primary/90 to-primary/70"
    },
    {
      icon: TrendingUp,
      title: "Predictive Risk Analysis",
      description: "Machine learning models analyze thousands of data points to predict creditworthiness and fraud risk in milliseconds.",
      tech: "Deep Learning",
      color: "from-primary/80 to-secondary"
    },
    {
      icon: Sparkles,
      title: "Intelligent Personalization",
      description: "Adaptive algorithms learn from your behavior to continuously refine product recommendations and user experience.",
      tech: "Reinforcement Learning",
      color: "from-secondary to-primary/90"
    },
    {
      icon: Zap,
      title: "Real-Time Processing",
      description: "Edge computing and stream processing enable instant decisions without the latency of traditional batch systems.",
      tech: "Distributed Computing",
      color: "from-primary to-accent"
    },
  ];

  return (
    <section className="py-20 px-4 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Powered by Advanced AI</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Revolutionary Technology Stack
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Cutting-edge AI and emerging technologies working together to eliminate friction and create seamless financial experiences
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-card rounded-2xl p-8 border border-border hover:border-primary/50 transition-all duration-500 hover:shadow-elevated animate-in fade-in slide-in-from-bottom-6"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient glow effect on hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

              {/* Icon */}
              <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:shadow-glow transition-all duration-300 group-hover:scale-110`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <div className="relative">
                <h3 className="text-xl font-bold text-card-foreground mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Tech badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-muted-foreground border border-border">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.color}`}></div>
                  {feature.tech}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Banner */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-border">
            <p className="text-4xl font-bold text-foreground mb-2">80%</p>
            <p className="text-muted-foreground">Faster Application Process</p>
          </div>
          <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-border">
            <p className="text-4xl font-bold text-foreground mb-2">40%</p>
            <p className="text-muted-foreground">Higher Approval Accuracy</p>
          </div>
          <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-border">
            <p className="text-4xl font-bold text-foreground mb-2">99.9%</p>
            <p className="text-muted-foreground">Identity Verification Accuracy</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIFeatures;
