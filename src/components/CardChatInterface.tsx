import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Send, Mic, MicOff, Volume2, Sparkles } from "lucide-react";
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
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-950 to-black">
      {/* Voice Controls - Floating */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-black/70 backdrop-blur-lg rounded-full px-4 py-2 border border-gray-800">
        <Switch
          id="auto-speak-card"
          checked={autoSpeak}
          onCheckedChange={setAutoSpeak}
          className="scale-75"
        />
        <Label htmlFor="auto-speak-card" className="text-xs text-gray-300 cursor-pointer">
          Auto-speak
        </Label>
        {isSpeaking && (
          <Volume2 className="h-3 w-3 text-pink-500 animate-pulse" />
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 md:p-6">
        <div className="space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 items-start animate-fade-in ${
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <Avatar className={`h-8 w-8 md:h-10 md:w-10 shrink-0 ${isSpeaking && message.role === "assistant" && index === messages.length - 1 ? 'animate-pulse' : ''}`}>
                <AvatarFallback className={
                  message.role === "user"
                    ? "bg-gradient-to-br from-red-500 to-pink-500 text-white font-bold"
                    : "bg-gradient-to-br from-gray-700 to-gray-800 text-white"
                }>
                  {message.role === "user" ? "Z" : <Sparkles className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] md:max-w-[70%] rounded-3xl px-5 py-4 shadow-lg ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-red-500 via-pink-500 to-purple-500 text-white"
                    : "bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100 border border-gray-700/50"
                }`}
              >
                <p className="text-base leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 items-start animate-fade-in">
              <Avatar className="h-8 w-8 md:h-10 md:w-10 shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-gray-700 to-gray-800 text-white">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl px-5 py-4 border border-gray-700/50">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-gray-800 bg-black/50 backdrop-blur-lg p-4 md:p-6">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !isListening && handleSend()}
              placeholder="Type your card request..."
              disabled={isLoading || isListening}
              className="bg-gray-900 border-2 border-gray-800 focus:border-pink-500 text-white placeholder:text-gray-500 rounded-2xl h-14 pr-12 text-base transition-colors"
            />
            <Button
              onClick={handleVoiceInput}
              disabled={isLoading}
              size="icon"
              variant="ghost"
              className={`absolute right-2 top-1/2 -translate-y-1/2 ${
                isListening ? "text-red-500 animate-pulse" : "text-gray-400 hover:text-white"
              }`}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
          </div>
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim() || isListening}
            size="icon"
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 h-14 w-14 rounded-2xl shadow-lg"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
