import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Paperclip, Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
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
    <div className="flex flex-col h-full">
      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-background p-4">
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant={inputMode === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInputMode('text')}
          >
            Text
          </Button>
          <Button
            variant={inputMode === 'voice' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInputMode('voice')}
          >
            Voice
          </Button>
        </div>
        
        {inputMode === 'text' ? (
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={() => sendMessage(input)}
              disabled={isLoading || !input.trim()}
              size="icon"
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleVoiceInput}
              disabled={isLoading}
              className={`flex-1 ${isRecording ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'}`}
            >
              {isRecording ? (
                <>
                  <MicOff className="h-4 w-4 mr-2" />
                  Recording... (Click to stop)
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Hold to Record
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
