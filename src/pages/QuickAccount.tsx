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
    <div className="h-screen w-full bg-gradient-to-b from-white to-gray-100 pt-16">
      <ChatInterface onIntentDetected={handleIntentDetected} />
    </div>
  );
};

export default QuickAccount;
