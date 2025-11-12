import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const FloatingChatbox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/quick-account');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleClick}
        size="icon"
        className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default FloatingChatbox;
