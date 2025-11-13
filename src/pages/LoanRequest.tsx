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
    <div className="h-screen w-full bg-gradient-to-b from-white to-gray-100 pt-16">
      <LoanChatInterface accountNumber={accountNumber!} />
    </div>
  );
};

export default LoanRequest;
