import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  onIntentDetected?: (accountType: string) => void;
}

const ChatInterface = ({ onIntentDetected }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m here to help you open a Zenith Bank account. What type of account would you like to open? (Savings, Business, or Current)' }
  ]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const sessionId = useRef(`session_${Date.now()}`);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-agent', {
        body: {
          messages: [...messages, userMessage],
          sessionId: sessionId.current
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Check if intent is detected
      if (data.intentDetected && data.intentData) {
        setTimeout(() => {
          onIntentDetected?.(data.intentData.accountType);
        }, 1000);
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    if (!isRecording) {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = async () => {
            const base64Audio = reader.result?.toString().split(',')[1];
            
            // Transcribe audio
            const { data, error } = await supabase.functions.invoke('stt-agent', {
              body: { audio: base64Audio }
            });

            if (error) {
              toast({
                title: "Error",
                description: "Failed to transcribe audio.",
                variant: "destructive",
              });
              return;
            }

            await sendMessage(data.text);
          };
          
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);

        // Stop after 5 seconds
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            setIsRecording(false);
          }
        }, 5000);

      } catch (error) {
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access to use voice input.",
          variant: "destructive",
        });
      }
    } else {
      // Stop recording handled by timeout
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-white to-gray-100">
      {/* Messages */}
      <ScrollArea className="flex-1 px-3 py-6 md:px-6">
        <div className="space-y-6 pb-32">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex gap-3 items-start animate-fade-in ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <Avatar className="h-8 w-8 md:h-10 md:w-10 shrink-0">
                <AvatarFallback className={
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-red-500 to-pink-500 text-white font-bold'
                    : 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700'
                }>
                  {message.role === 'user' ? 'Z' : <Sparkles className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] md:max-w-[70%] rounded-3xl px-5 py-4 shadow-lg ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-red-500 via-pink-500 to-purple-500 text-white'
                    : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900 border border-gray-300'
                }`}
              >
                <p className="text-base leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 items-start animate-fade-in">
              <Avatar className="h-8 w-8 md:h-10 md:w-10 shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700">
                  <Sparkles className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl px-5 py-4 border border-gray-300">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-300 bg-white/50 backdrop-blur-lg p-3 md:p-6 z-10">
        <div className="flex gap-2 items-end max-w-3xl mx-auto">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isRecording && sendMessage(input)}
              placeholder="Type your message..."
              disabled={isLoading || isRecording}
              className="bg-white border-2 border-gray-300 focus:border-pink-500 text-gray-900 placeholder:text-gray-400 rounded-2xl h-14 pr-12 text-base transition-colors"
            />
            <Button
              onClick={handleVoiceInput}
              disabled={isLoading}
              size="icon"
              variant="ghost"
              className={`absolute right-2 top-1/2 -translate-y-1/2 ${
                isRecording ? 'text-red-500 animate-pulse' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
          </div>
          <Button
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim() || isRecording}
            size="icon"
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 h-14 w-14 rounded-2xl shadow-lg"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
