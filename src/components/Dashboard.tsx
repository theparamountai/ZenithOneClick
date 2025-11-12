import { Landmark, CreditCard, TrendingUp, Users, DollarSign, Star, TrendingUp as Growth } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const offers = [
    {
      icon: Landmark,
      name: "Smart Account Opening",
      type: "Bank Account",
      status: "Pre-Qualified",
      badge: "Recommended",
      gradient: "from-primary to-primary/80",
      details: [
        "Open Savings Account in 1 click",
        "Business Account available",
        "Zero minimum balance",
      ],
      action: () => navigate("/apply-checking-account"),
    },
    {
      icon: CreditCard,
      name: "One-Click Card Request",
      type: "Debit/Credit Card",
      status: "Pre-Qualified",
      badge: "Popular",
      gradient: "from-primary/90 to-secondary",
      details: [
        "Smart card application",
        "Instant approval process",
        "Choose from Naira Mastercard or Visa",
      ],
      action: () => navigate("/apply-credit-card"),
    },
    {
      icon: TrendingUp,
      name: "Flexible Personal Loan",
      type: "Personal Loan",
      status: "Pre-Qualified",
      badge: "Best Rate",
      gradient: "from-secondary to-primary",
      details: [
        "Loan Amount: Up to ₦5,000,000",
        "Rate: 6.99% APR",
        "Term: 36-60 months",
      ],
      action: () => navigate("/apply-personal-loan"),
    },
  ];

  const stats = [
    { icon: Users, label: "Active Users", value: "2.5M+", color: "text-primary" },
    { icon: DollarSign, label: "Loans Funded", value: "₦84B+", color: "text-primary" },
    { icon: Star, label: "User Rating", value: "4.9/5", color: "text-primary" },
    { icon: Growth, label: "Avg. Approval", value: "98.7%", color: "text-primary" },
  ];

  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Powered by AI</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Your Pre-Qualified Offers
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Based on your financial profile, you're pre-approved for these instant-activation products
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {offers.map((offer, index) => (
            <div
              key={offer.name}
              className="relative group animate-in fade-in slide-in-from-bottom-6 duration-1000"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 from-primary/20 to-primary/5 rounded-3xl blur-xl transition-all duration-500"></div>
              <div className="relative bg-card rounded-3xl p-8 border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-elevated h-full flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${offer.gradient}`}>
                    <offer.icon className="w-8 h-8 text-white" />
                  </div>
                  <Badge className="bg-primary text-primary-foreground">{offer.badge}</Badge>
                </div>

                <div className="flex-grow">
                  <h3 className="text-2xl font-bold text-card-foreground mb-2">{offer.name}</h3>
                  <p className="text-sm text-muted-foreground mb-1">{offer.type}</p>
                  <Badge variant="outline" className="mb-6 text-primary border-primary/30">
                    {offer.status}
                  </Badge>

                  <div className="space-y-3 mb-8">
                    {offer.details.map((detail, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-muted-foreground">{detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={offer.action}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 rounded-xl shadow-card transition-all hover:shadow-glow group-hover:scale-105"
                >
                  Activate in 1 Click
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-muted/30 rounded-3xl border border-border">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${(index + 3) * 150}ms` }}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-card-foreground mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
