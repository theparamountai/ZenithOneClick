import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import LoanChatInterface from "@/components/LoanChatInterface";

const LoanRequest = () => {
  const { accountNumber } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accountExists, setAccountExists] = useState(false);

  useEffect(() => {
    checkAccount();
  }, [accountNumber]);

  const checkAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to request a loan");
        navigate("/auth");
        return;
      }

      const { data: account, error } = await supabase
        .from("bank_accounts")
        .select("id")
        .eq("account_number", accountNumber)
        .eq("user_id", user.id)
        .single();

      if (error || !account) {
        toast.error("Account not found");
        navigate("/dashboard");
        return;
      }

      setAccountExists(true);
    } catch (error) {
      console.error("Error checking account:", error);
      toast.error("Failed to verify account");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!accountExists) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/loan-history/${accountNumber}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Loan History
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Request a Loan</h1>
          <p className="text-muted-foreground">
            Tell us about your loan needs and our AI will assess your eligibility
          </p>
        </div>

        <LoanChatInterface accountNumber={accountNumber!} />
      </div>
    </div>
  );
};

export default LoanRequest;
