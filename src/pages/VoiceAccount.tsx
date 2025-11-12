import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import VoiceInterface from "@/components/VoiceInterface";

const VoiceAccount = () => {
  const navigate = useNavigate();

  const handleDataComplete = (data: any) => {
    navigate('/account-confirmation', { state: { accountData: data } });
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
            <h1 className="text-xl font-bold text-foreground">Voice Account Opening</h1>
            <p className="text-sm text-muted-foreground">Speak with our AI assistant</p>
          </div>
        </div>
      </div>

      {/* Voice Interface */}
      <div className="flex-1 container mx-auto max-w-4xl">
        <VoiceInterface onDataComplete={handleDataComplete} />
      </div>
    </div>
  );
};

export default VoiceAccount;
