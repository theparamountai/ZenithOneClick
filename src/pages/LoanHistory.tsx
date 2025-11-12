import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Plus, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface Loan {
  id: string;
  loan_amount: number;
  loan_purpose: string;
  loan_term_months: number;
  interest_rate: number;
  monthly_payment: number;
  total_repayment: number;
  status: string;
  requested_at: string;
  decision_at: string | null;
}

const LoanHistory = () => {
  const { accountNumber } = useParams();
  const navigate = useNavigate();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [accountType, setAccountType] = useState("");

  useEffect(() => {
    loadLoans();
  }, [accountNumber]);

  const loadLoans = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to view loans");
        navigate("/auth");
        return;
      }

      // Get account details
      const { data: account, error: accountError } = await supabase
        .from("bank_accounts")
        .select("id, account_type")
        .eq("account_number", accountNumber)
        .eq("user_id", user.id)
        .single();

      if (accountError || !account) {
        toast.error("Account not found");
        navigate("/dashboard");
        return;
      }

      setAccountType(account.account_type);

      // Get loans for this account
      const { data: loansData, error: loansError } = await supabase
        .from("loans")
        .select("*")
        .eq("account_id", account.id)
        .order("created_at", { ascending: false });

      if (loansError) throw loansError;

      setLoans(loansData || []);
    } catch (error) {
      console.error("Error loading loans:", error);
      toast.error("Failed to load loans");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      pending: { variant: "secondary", label: "Pending" },
      approved: { variant: "default", label: "Approved" },
      rejected: { variant: "destructive", label: "Rejected" },
      disbursed: { variant: "default", label: "Disbursed" },
      closed: { variant: "outline", label: "Closed" },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/bank-account/${accountNumber}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Account
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Loan History</h1>
          <p className="text-muted-foreground">
            Account {accountNumber} • {accountType}
          </p>
        </div>

        <div className="mb-6">
          <Button
            onClick={() => navigate(`/loan-request/${accountNumber}`)}
            size="lg"
            className="w-full sm:w-auto"
          >
            <Plus className="h-5 w-5 mr-2" />
            Request a Loan
          </Button>
        </div>

        {loans.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Loans Yet</h3>
              <p className="text-muted-foreground text-center mb-6">
                You haven't applied for any loans yet. Get started by requesting a loan.
              </p>
              <Button onClick={() => navigate(`/loan-request/${accountNumber}`)}>
                <Plus className="h-4 w-4 mr-2" />
                Request Your First Loan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {loans.map((loan) => (
              <Card key={loan.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        ₦{Number(loan.loan_amount).toLocaleString()}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {loan.loan_purpose}
                      </p>
                    </div>
                    {getStatusBadge(loan.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Monthly Payment</p>
                        <p className="font-semibold">
                          ₦{Number(loan.monthly_payment).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Loan Term</p>
                        <p className="font-semibold">{loan.loan_term_months} months</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Interest Rate</p>
                        <p className="font-semibold">{loan.interest_rate}% APR</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Total Repayment</p>
                        <p className="font-semibold">
                          ₦{Number(loan.total_repayment).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      Requested on {new Date(loan.requested_at).toLocaleDateString('en-NG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanHistory;
