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
    <div className="min-h-screen bg-black flex flex-col">
      <header className="border-b border-gray-800 bg-gradient-to-r from-gray-950 to-gray-900 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">Request a Card</h1>
              <p className="text-sm text-gray-400">
                Chat with our AI to request your debit card
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 pt-24">
        <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] bg-gradient-to-b from-gray-950 to-black border border-gray-800 rounded-lg shadow-2xl overflow-hidden">
          <CardChatInterface />
        </div>
      </main>
    </div>
  );
}
