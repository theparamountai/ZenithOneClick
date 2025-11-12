import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatInterface from "@/components/ChatInterface";

const QuickAccount = () => {
  const navigate = useNavigate();

  const handleIntentDetected = (accountType: string) => {
    // Navigate to document scanner with account type
    navigate('/document-scanner', { state: { accountType } });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pt-20">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/onboarding-choice')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Quick Account Opening</h1>
            <p className="text-sm text-muted-foreground">Chat with our AI assistant</p>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 container mx-auto max-w-4xl">
        <ChatInterface onIntentDetected={handleIntentDetected} />
      </div>
    </div>
  );
};

export default QuickAccount;
