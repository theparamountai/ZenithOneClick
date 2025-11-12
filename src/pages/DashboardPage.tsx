import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Building2, DollarSign, TrendingUp, Users, Star, Landmark, Copy, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Profile {
  first_name: string;
  last_name: string;
  annual_income: number;
  employment_status: string;
  monthly_expenses: number;
}

interface BankAccount {
  id: string;
  account_number: string;
  account_name: string;
  account_type: string;
  balance: number;
  currency: string;
  status: string;
  created_at: string;
  bank_provider: 'zenith' | 'opay';
  external_reference?: string;
  last_synced?: string;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBankAccounts, setLoadingBankAccounts] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();

      if (error) {
        console.error("Error fetching profile:", error);
      } else if (data) {
        if (!data.onboarding_completed) {
          navigate("/onboarding");
          return;
        }
        setProfile(data);
      }
      setLoading(false);
    };

    const fetchBankAccounts = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching bank accounts:", error);
      } else if (data) {
        setBankAccounts(data.map((account: any) => ({
          ...account,
          bank_provider: account.bank_provider || 'zenith',
          external_reference: account.external_reference || undefined,
          last_synced: account.last_synced || undefined,
        })) as BankAccount[]);
      }
      setLoadingBankAccounts(false);
    };

    fetchProfile();
    fetchBankAccounts();
  }, [navigate]);

  const copyAccountNumber = (accountNumber: string) => {
    navigator.clipboard.writeText(accountNumber);
    toast.success("Account number copied to clipboard");
  };

  const getBankCardGradient = (provider: 'zenith' | 'opay') => {
    switch(provider) {
      case 'zenith':
        return 'from-primary to-primary/80'; // Red
      case 'opay':
        return 'from-emerald-500 to-emerald-700'; // Green
      default:
        return 'from-gray-500 to-gray-700';
    }
  };

  const getBankLabel = (provider: 'zenith' | 'opay') => {
    switch(provider) {
      case 'zenith':
        return 'Zenith Bank Account';
      case 'opay':
        return 'OPay Merchant Account';
      default:
        return 'Bank Account';
    }
  };

  const handleOfferClick = (route: string) => {
    if (bankAccounts.length === 0) {
      toast.error("You need to open a bank account first before applying for cards or loans");
      return;
    }
    navigate(route);
  };

  const offers = [
    {
      icon: Landmark,
      name: "Smart Account Opening",
      type: "account_opening",
      status: "Available",
      badge: "New",
      gradient: "from-blue-500 to-blue-700",
      details: ["Open Savings or Business Account", "No minimum balance required", "Instant account activation"],
      action: () => navigate("/onboarding-choice"),
    },
    {
      icon: CreditCard,
      name: "One-Click Card Request",
      type: "card_request",
      status: "Available",
      badge: "Hot",
      gradient: "from-purple-500 to-pink-600",
      details: [
        "Credit Limit: ₦500,000 - ₦2,000,000",
        "Naira or Dollar currency options",
        "Mastercard, Visa, or Verve",
      ],
      action: () => handleOfferClick("/card-request"),
    },
    {
      icon: DollarSign,
      name: "Flexible Personal Loan",
      type: "personal_loan",
      status: "Available",
      badge: "Popular",
      gradient: "from-green-500 to-emerald-600",
      details: ["Up to ₦5,000,000", "Competitive interest rates", "Flexible repayment: 6-36 months"],
      action: () => handleOfferClick("/loan-request"),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-6 overflow-y-auto pt-20">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-24 w-full" />
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-6 overflow-y-auto pt-20">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-card rounded-lg shadow-sm p-6 border">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.first_name}!</h1>
          <p className="text-muted-foreground">Manage your accounts and explore personalized offers</p>
        </div>

        {/* My Bank Accounts Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">My Bank Accounts</h2>
          {loadingBankAccounts ? (
            <div className="grid md:grid-cols-3 gap-6">
              <Skeleton className="h-64" />
            </div>
          ) : bankAccounts.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {bankAccounts.map((account) => (
                <Card
                  key={account.id}
                  className="relative overflow-hidden border-2 hover:border-primary/50 transition-all hover:-translate-y-1 duration-300 hover:shadow-lg"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${getBankCardGradient(account.bank_provider)} opacity-95`}></div>
                  <CardHeader className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Landmark className="h-6 w-6 text-white" />
                      </div>
                      <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                        {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                      </Badge>
                    </div>
                    <CardTitle className="text-white text-xl">{account.account_name}</CardTitle>
                    <CardDescription className="text-white/80 font-medium">
                      {getBankLabel(account.bank_provider)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative z-10 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <div>
                          <p className="text-xs text-white/70">Account Number</p>
                          <p className="text-sm font-mono font-semibold text-white">{account.account_number}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyAccountNumber(account.account_number)}
                          className="h-8 w-8 p-0 hover:bg-white/20 text-white"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <p className="text-xs text-white/70">Current Balance</p>
                        <p className="text-2xl font-bold text-white">
                          {account.currency}
                          {account.balance.toLocaleString("en-NG", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => navigate(`/bank-account/${account.account_number}`)}
                        className="flex-1 bg-white hover:bg-white/90 text-primary font-semibold"
                        size="sm"
                      >
                        View Details
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Add Bank Account Card */}
              <Card className="border-2 border-dashed hover:border-emerald-500 transition-all hover:-translate-y-1 duration-300 cursor-pointer group">
                <CardContent 
                  className="flex flex-col items-center justify-center py-12 h-full"
                  onClick={() => navigate("/add-bank-account")}
                >
                  <div className="p-4 bg-emerald-500/10 group-hover:bg-emerald-500/20 rounded-full mb-4 transition-colors">
                    <Building2 className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Add a Bank Account</h3>
                  <p className="text-muted-foreground text-center text-sm mb-4">
                    Connect external banks to view all your finances
                  </p>
                  <Button variant="outline" className="border-emerald-500 text-emerald-600 hover:bg-emerald-500/10">
                    Add Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="p-4 bg-muted rounded-full mb-4">
                  <Landmark className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Bank Accounts Yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Open your first account to get started with Zenith Bank
                </p>
                <Button onClick={() => navigate("/onboarding-choice")}>Open Your First Account</Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6">One-Click Services</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {offers.map((offer, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-all hover:-translate-y-1 duration-300 border-2 hover:border-primary/50"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <offer.icon className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant={offer.status === "Pre-Approved" ? "default" : "secondary"}>{offer.status}</Badge>
                  </div>
                  <CardTitle className="mt-4">{offer.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {offer.details.map((detail, i) => (
                      <div key={i} className="text-sm text-muted-foreground flex items-center">
                        <span className="mr-2">•</span>
                        {detail}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">2.5M+</p>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">$50B+</p>
                  <p className="text-sm text-muted-foreground">Loans Funded</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">4.8/5</p>
                  <p className="text-sm text-muted-foreground">User Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">98%</p>
                  <p className="text-sm text-muted-foreground">Avg. Approval</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
