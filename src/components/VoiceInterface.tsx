import { useState, useEffect, useRef } from "react";
import { Circle, PhoneOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface VoiceInterfaceProps {
  onDataComplete?: (data: any) => void;
}

const VoiceInterface = ({ onDataComplete }: VoiceInterfaceProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [collectedData, setCollectedData] = useState({
    fullName: false,
    gender: false,
    address: false,
    ninNumber: false,
    accountType: false,
  });
  const [extractedData, setExtractedData] = useState<any>({});
  const extractedDataRef = useRef<any>({}); // Ref to avoid closure issues
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sessionConfiguredRef = useRef(false);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.autoplay = true;
    
    return () => {
      disconnect();
    };
  }, []);

  const connect = async () => {
    setIsConnecting(true);
    
    try {
      // Get session token from edge function
      const { data: sessionData, error } = await supabase.functions.invoke('realtime-voice-agent');
      
      if (error) throw error;

      const EPHEMERAL_KEY = sessionData.client_secret.value;
      
      // Create peer connection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // Set up remote audio
      pc.ontrack = (e) => {
        if (audioRef.current) {
          audioRef.current.srcObject = e.streams[0];
        }
      };

      // Add local audio track
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      pc.addTrack(stream.getTracks()[0]);

      // Set up data channel for events
      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;
      
      dc.addEventListener("message", (e) => {
        const event = JSON.parse(e.data);
        console.log("Received event:", event);
        
        // Configure session after it's created
        if (event.type === 'session.created' && !sessionConfiguredRef.current) {
          console.log('Session created, sending configuration...');
          sessionConfiguredRef.current = true;
          
          // Send session update with proper VAD settings
          dc.send(JSON.stringify({
            type: 'session.update',
            session: {
              modalities: ['text', 'audio'],
              instructions: `You are a friendly Zenith Bank account opening assistant. Your goal is to collect the following information from the user through a natural conversation:

1. Full Name (first and last name)
2. Gender (Male or Female)
3. Full Residential Address (including street, city, state)
4. NIN Number (11 digits - National Identification Number)
5. Account Type (Savings, Business, or Current)

CRITICAL Guidelines:
- Be warm, professional, and efficient
- Ask for ONE piece of information at a time and WAIT for the user's complete response
- After the user provides information, CONFIRM it back to them explicitly (e.g., "Just to confirm, your name is John Doe, is that correct?")
- Only move to the next question AFTER the user confirms the information
- If information seems incomplete or unclear, politely ask for clarification
- Use Nigerian context and terminology
- As you collect and CONFIRM each piece of information, call the appropriate function to record it
- ONLY call the complete_account_opening function AFTER all 5 pieces of information are collected AND confirmed with the user
- Do NOT cut yourself off mid-sentence - complete your questions and confirmations fully

After collecting all information, thank the user and let them know they'll be able to review and edit the information before final submission.`,
              voice: 'alloy',
              input_audio_format: 'pcm16',
              output_audio_format: 'pcm16',
              input_audio_transcription: {
                model: 'whisper-1'
              },
              turn_detection: {
                type: 'server_vad',
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 1000
              },
              temperature: 0.8,
              max_response_output_tokens: 'inf'
            }
          }));
          console.log('Session configuration sent');
        }
        
        // Handle transcripts
        if (event.type === 'conversation.item.input_audio_transcription.completed') {
          setTranscript(prev => prev + ' ' + event.transcript);
        }
        
        // Handle function calls from AI
        if (event.type === 'response.function_call_arguments.done') {
          const functionName = event.name;
          const args = JSON.parse(event.arguments);
          console.log('Function called:', functionName, 'with args:', args);
          
          // Update collected data based on function calls
          // Update BOTH state and ref to avoid closure issues
          if (functionName === 'record_full_name') {
            console.log('Recording full name:', args.fullName);
            setCollectedData(prev => ({ ...prev, fullName: true }));
            setExtractedData(prev => {
              const newData = { ...prev, fullName: args.fullName };
              extractedDataRef.current = newData; // Update ref
              console.log('Updated extractedData:', newData);
              return newData;
            });
          } else if (functionName === 'record_gender') {
            console.log('Recording gender:', args.gender);
            setCollectedData(prev => ({ ...prev, gender: true }));
            setExtractedData(prev => {
              const newData = { ...prev, gender: args.gender };
              extractedDataRef.current = newData;
              console.log('Updated extractedData:', newData);
              return newData;
            });
          } else if (functionName === 'record_address') {
            console.log('Recording address:', args.address);
            setCollectedData(prev => ({ ...prev, address: true }));
            setExtractedData(prev => {
              const newData = { ...prev, address: args.address };
              extractedDataRef.current = newData;
              console.log('Updated extractedData:', newData);
              return newData;
            });
          } else if (functionName === 'record_nin') {
            console.log('Recording NIN:', args.ninNumber);
            setCollectedData(prev => ({ ...prev, ninNumber: true }));
            setExtractedData(prev => {
              const newData = { ...prev, ninNumber: args.ninNumber };
              extractedDataRef.current = newData;
              console.log('Updated extractedData:', newData);
              return newData;
            });
          } else if (functionName === 'record_account_type') {
            console.log('Recording account type:', args.accountType);
            setCollectedData(prev => ({ ...prev, accountType: true }));
            setExtractedData(prev => {
              const newData = { ...prev, accountType: args.accountType };
              extractedDataRef.current = newData;
              console.log('Updated extractedData:', newData);
              return newData;
            });
          } else if (functionName === 'complete_account_opening') {
            // All data collected, trigger completion
            console.log('Account opening complete!');
            console.log('Final extracted data from ref:', extractedDataRef.current);
            disconnect();
            onDataComplete?.(extractedDataRef.current); // Use ref instead of state
          }
        }
      });

      // Create and set local description
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Connect to OpenAI Realtime API
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp"
        },
      });

      const answer = {
        type: "answer" as RTCSdpType,
        sdp: await sdpResponse.text(),
      };
      
      await pc.setRemoteDescription(answer);
      setIsConnected(true);
      setIsConnecting(false);
      
      // Set 10-minute timeout for inactivity
      timeoutRef.current = setTimeout(() => {
        toast({
          title: "Session Timeout",
          description: "Voice session ended due to inactivity. Please try again.",
          variant: "destructive",
        });
        disconnect();
      }, 600000); // 10 minutes
      
      toast({
        title: "Connected",
        description: "Voice conversation started. Speak naturally with the AI agent.",
      });

    } catch (error) {
      console.error("Connection error:", error);
      setIsConnecting(false);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to start voice conversation",
        variant: "destructive",
      });
    }
  };

  const disconnect = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    dcRef.current?.close();
    pcRef.current?.close();
    setIsConnected(false);
    setTranscript('');
    sessionConfiguredRef.current = false; // Reset for next connection
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-8">
      {/* Microphone Visualization */}
      <div className="relative mb-8">
        <div className={`w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center ${isConnected ? 'animate-pulse' : ''}`}>
          <div className="w-24 h-24 rounded-full bg-primary/40 flex items-center justify-center">
            <Circle className={`h-12 w-12 text-primary fill-primary ${isConnected ? 'animate-pulse' : ''}`} />
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {isConnecting ? 'Connecting...' : isConnected ? 'Listening...' : 'Ready to Start'}
        </h2>
        <p className="text-muted-foreground">
          {isConnected ? 'Speak naturally with our AI agent' : 'Click the button to begin'}
        </p>
      </div>


      {/* Progress Indicators */}
      {isConnected && (
        <div className="w-full max-w-md mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Information Collected:</h3>
          <div className="space-y-2">
            {Object.entries(collectedData).map(([key, collected]) => (
              <div key={key} className="flex items-center gap-2 text-sm">
                {collected ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                )}
                <span className={collected ? 'text-foreground' : 'text-muted-foreground'}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Control Button */}
      {!isConnected ? (
        <Button
          onClick={connect}
          disabled={isConnecting}
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
        >
          {isConnecting ? 'Connecting...' : 'Start Conversation'}
        </Button>
      ) : (
        <Button
          onClick={disconnect}
          size="lg"
          variant="destructive"
          className="px-8"
        >
          <PhoneOff className="h-4 w-4 mr-2" />
          End Call
        </Button>
      )}
    </div>
  );
};

export default VoiceInterface;
