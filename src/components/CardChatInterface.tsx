import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Send, Mic, MicOff, Volume2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { audioPlayer } from "@/utils/audioPlayer";

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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
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

      // Speak the response if auto-speak is enabled
      if (autoSpeak) {
        await speakResponse(aiResponse);
      }

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

  const speakResponse = async (text: string) => {
    try {
      setIsSpeaking(true);
      const { data, error } = await supabase.functions.invoke('tts-agent', {
        body: { text, voice: 'alloy' }
      });

      if (error) throw error;

      if (data?.audioContent) {
        await audioPlayer.play(data.audioContent);
      }
    } catch (error) {
      console.error('Error speaking response:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleVoiceInput = async () => {
    if (isListening) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      // Start recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        
        // Convert to base64 and send to STT
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result?.toString().split(',')[1];
          if (base64Audio) {
            await processVoiceInput(base64Audio);
          }
        };
      };

      mediaRecorder.start();
      setIsListening(true);
      toast.info("Recording... Click again to stop");
    } catch (error) {
      console.error("Voice input error:", error);
      toast.error("Failed to access microphone");
    }
  };

  const processVoiceInput = async (audioBase64: string) => {
    try {
      toast.info("Transcribing audio...");
      
      const { data, error } = await supabase.functions.invoke('stt-agent', {
        body: { audio: audioBase64 }
      });

      if (error) throw error;

      if (data?.text) {
        setInput(data.text);
        toast.success("Transcription complete!");
      }
    } catch (error) {
      console.error("Transcription error:", error);
      toast.error("Failed to transcribe audio");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Voice Controls */}
      <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label htmlFor="auto-speak-card" className="text-sm">Auto-speak responses</Label>
          <Switch
            id="auto-speak-card"
            checked={autoSpeak}
            onCheckedChange={setAutoSpeak}
          />
        </div>
        {isSpeaking && (
          <div className="flex items-center gap-2 text-sm text-primary">
            <Volume2 className="h-4 w-4 animate-pulse" />
            Speaking...
          </div>
        )}
      </div>

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
