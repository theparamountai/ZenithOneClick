import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const LoanConfirmation = () => {
  const { accountNumber } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { loanAmount, loanPurpose, loanTermMonths, interestRate, analysis } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [accountData, setAccountData] = useState<any>(null);
  
  const [editableLoanAmount, setEditableLoanAmount] = useState(loanAmount || 0);
  const [editableLoanPurpose, setEditableLoanPurpose] = useState(loanPurpose || "");
  const [editableLoanTerm, setEditableLoanTerm] = useState(loanTermMonths || 12);

  useEffect(() => {
    if (!loanAmount || !analysis) {
      toast.error("Invalid loan data");
      navigate(`/loan-request/${accountNumber}`);
      return;
    }
    loadAccountData();
  }, [accountNumber]);

  const loadAccountData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in");
        navigate("/auth");
        return;
      }

      const { data: account, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("account_number", accountNumber)
        .eq("user_id", user.id)
        .single();

      if (error || !account) {
        toast.error("Account not found");
        navigate("/dashboard");
        return;
      }

      setAccountData(account);
    } catch (error) {
      console.error("Error loading account:", error);
      toast.error("Failed to load account data");
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyPayment = (amount: number, rate: number, months: number) => {
    const monthlyRate = rate / 100 / 12;
    const payment = amount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                    (Math.pow(1 + monthlyRate, months) - 1);
    return payment;
  };

  const monthlyPayment = calculateMonthlyPayment(editableLoanAmount, interestRate, editableLoanTerm);
  const totalRepayment = monthlyPayment * editableLoanTerm;

  const handleSubmit = async () => {
    if (!accountData) return;

    if (editableLoanAmount > analysis.max_loan_amount) {
      toast.error(`Loan amount cannot exceed approved amount of ₦${analysis.max_loan_amount.toLocaleString()}`);
      return;
    }

    if (!editableLoanPurpose.trim()) {
      toast.error("Please provide a loan purpose");
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("loans").insert({
        user_id: user.id,
        account_id: accountData.id,
        loan_amount: editableLoanAmount,
        loan_purpose: editableLoanPurpose,
        loan_term_months: editableLoanTerm,
        interest_rate: interestRate,
        monthly_payment: monthlyPayment,
        total_repayment: totalRepayment,
        status: "approved",
        ai_analysis: analysis,
        decision_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success("Loan application submitted successfully!");
      navigate(`/loan-history/${accountNumber}`);
    } catch (error) {
      console.error("Error submitting loan:", error);
      toast.error("Failed to submit loan application");
    } finally {
      setSubmitting(false);
    }
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
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/loan-request/${accountNumber}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Confirm Your Loan</h1>
          <p className="text-muted-foreground">
            Review and confirm your loan details before submission
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Full Name</Label>
                  <p className="font-medium">{accountData?.full_name || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Account Number</Label>
                  <p className="font-medium">{accountData?.account_number}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Account Type</Label>
                  <p className="font-medium capitalize">{accountData?.account_type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Current Balance</Label>
                  <p className="font-medium">₦{Number(accountData?.balance || 0).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">NIN Number</Label>
                  <p className="font-medium">{accountData?.nin_number || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Address</Label>
                  <p className="font-medium text-sm">{accountData?.address || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Loan Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="loanAmount">Loan Amount (₦)</Label>
                <Input
                  id="loanAmount"
                  type="number"
                  value={editableLoanAmount}
                  onChange={(e) => setEditableLoanAmount(Number(e.target.value))}
                  max={analysis.max_loan_amount}
                  min={1000}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum approved: ₦{analysis.max_loan_amount.toLocaleString()}
                </p>
              </div>

              <div>
                <Label htmlFor="loanPurpose">Loan Purpose</Label>
                <Input
                  id="loanPurpose"
                  value={editableLoanPurpose}
                  onChange={(e) => setEditableLoanPurpose(e.target.value)}
                  placeholder="e.g., Business inventory"
                />
              </div>

              <div>
                <Label htmlFor="loanTerm">Repayment Term</Label>
                <Select
                  value={editableLoanTerm.toString()}
                  onValueChange={(value) => setEditableLoanTerm(Number(value))}
                >
                  <SelectTrigger id="loanTerm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                    <SelectItem value="18">18 months</SelectItem>
                    <SelectItem value="24">24 months</SelectItem>
                    <SelectItem value="36">36 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interest Rate:</span>
                  <span className="font-semibold">{interestRate}% APR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Payment:</span>
                  <span className="font-semibold">₦{Math.round(monthlyPayment).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total Repayment:</span>
                  <span className="font-bold text-primary">
                    ₦{Math.round(totalRepayment).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            size="lg"
            className="w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Loan Application"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoanConfirmation;
