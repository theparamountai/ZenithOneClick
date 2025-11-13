import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CardChatInterface from "@/components/CardChatInterface";
import { checkUserHasAccount } from "@/utils/accountValidation";

export default function CardRequest() {
  const navigate = useNavigate();
  const [isCheckingAccount, setIsCheckingAccount] = useState(true);

  useEffect(() => {
    const checkAccount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please log in to request a card");
        navigate("/auth");
        return;
      }

      const hasAccount = await checkUserHasAccount(user.id);
      
      if (!hasAccount) {
        toast.error("You need to open a bank account first before requesting a card");
        navigate("/dashboard");
        return;
      }

      setIsCheckingAccount(false);
    };

    checkAccount();
  }, [navigate]);

  if (isCheckingAccount) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Checking your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-gradient-to-b from-white to-gray-100 pt-16">
      <CardChatInterface />
    </div>
  );
}
