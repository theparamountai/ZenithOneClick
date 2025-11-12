import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, FileText, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const BankAccountPage = () => {
  const { accountNumber } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccount();
  }, [accountNumber]);

  const loadAccount = async () => {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('account_number', accountNumber)
        .single();

      if (error) throw error;
      setAccount(data);
    } catch (error) {
      console.error('Error loading account:', error);
      toast({
        title: "Error",
        description: "Failed to load account details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Account not found</p>
            <Button onClick={() => navigate('/dashboard')} className="w-full mt-4">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const accountTypeDisplay = {
    savings: 'Zenith Savings Account',
    business: 'Zenith Business Account',
    current: 'Zenith Current Account'
  }[account.account_type] || 'Zenith Account';

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Account Dashboard</h1>
            <p className="text-sm text-muted-foreground">{account.account_name}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Main Account Card */}
        <Card className="mb-6 border-2 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold text-foreground mb-2">
                  {account.currency}{account.balance.toFixed(2)}
                </CardTitle>
                <p className="text-sm text-muted-foreground">Account Balance</p>
              </div>
              <Badge className="bg-green-500 text-white">{account.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Account Number</p>
                <p className="text-xl font-bold text-foreground">{account.account_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Account Type</p>
                <p className="text-lg font-semibold text-foreground">{accountTypeDisplay}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Button
            variant="outline"
            className="h-24 flex-col gap-2 border-primary text-primary hover:bg-primary/10"
            onClick={() => navigate(`/transaction-history/${accountNumber}`)}
          >
            <FileText className="h-6 w-6" />
            <span className="text-sm">View History</span>
            <span className="text-xs">All transactions</span>
          </Button>
          <Button
            variant="outline"
            className="h-24 flex-col gap-2 border-primary text-primary hover:bg-primary/10"
            onClick={() => navigate(`/loan-history/${accountNumber}`)}
          >
            <Send className="h-6 w-6" />
            <span className="text-sm">Loan</span>
            <span className="text-xs">Request & manage</span>
          </Button>
          <Button
            variant="outline"
            className="h-24 flex-col gap-2 border-primary text-primary hover:bg-primary/10"
            onClick={() => navigate('/my-cards')}
          >
            <CreditCard className="h-6 w-6" />
            <span className="text-sm">My Cards</span>
            <span className="text-xs">Manage cards</span>
          </Button>
        </div>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Account Name</p>
                <p className="font-semibold text-foreground">{account.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date Opened</p>
                <p className="font-semibold text-foreground">
                  {new Date(account.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Branch</p>
                <p className="font-semibold text-foreground">Online Branch</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Account Officer</p>
                <p className="font-semibold text-foreground">Demo Officer</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Notice */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-center text-muted-foreground">
            This is a demo account for preview purposes. No real banking transactions can be performed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BankAccountPage;
