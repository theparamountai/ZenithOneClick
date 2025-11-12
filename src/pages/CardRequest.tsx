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
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Card Request</h1>
            <p className="text-sm text-muted-foreground">
              Chat with our AI to request your debit card
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] bg-card border rounded-lg shadow-sm">
          <CardChatInterface />
        </div>
      </main>
    </div>
  );
}
