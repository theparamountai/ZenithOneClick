import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Send, Mic, MicOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CardChatInterfaceProps {
  onIntentDetected?: (intent: { card_type: string; currency: string; category: string }) => void;
}

export default function CardChatInterface({ onIntentDetected }: CardChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'll help you request a debit card. Tell me what type of card you'd like. For example: 'Create a Savings VISA Naira card for me'"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("card-bot", {
        body: { message: userMessage }
      });

      if (error) throw error;

      const aiResponse = data.message;
      setMessages(prev => [...prev, { role: "assistant", content: aiResponse }]);

      // Try to parse intent
      try {
        const intent = JSON.parse(aiResponse);
        if (intent.intent_detected === true) {
          // Intent detected, navigate to confirmation
          setTimeout(() => {
            navigate("/card-confirmation", { 
              state: { 
                cardType: intent.card_type,
                currency: intent.currency,
                category: intent.category
              } 
            });
          }, 1000);
        }
      } catch {
        // Not JSON, just a regular message
      }

    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I'm sorry, I encountered an error. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    if (isListening) {
      setIsListening(false);
      toast.info("Voice input stopped");
      return;
    }

    setIsListening(true);
    toast.info("Voice input started - speak now");

    try {
      // Simulate voice input for demo
      setTimeout(() => {
        setIsListening(false);
        toast.info("Voice input feature coming soon");
      }, 2000);
    } catch (error) {
      console.error("Voice input error:", error);
      setIsListening(false);
      toast.error("Voice input failed");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleVoiceInput}
            variant="outline"
            size="icon"
            disabled={isLoading}
            className={isListening ? "bg-primary text-primary-foreground" : ""}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
