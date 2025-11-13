import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Send, Loader2, CheckCircle, XCircle, Sparkles, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { audioPlayer } from "@/utils/audioPlayer";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface LoanAnalysis {
  eligible: boolean;
  max_loan_amount: number;
  suggested_interest_rate: number;
  monthly_payment: number;
  reasoning: string;
  risk_factors: string[];
  approval_confidence: number;
  recommendations: string[];
}

interface LoanChatInterfaceProps {
  accountNumber: string;
}

const LoanChatInterface = ({ accountNumber }: LoanChatInterfaceProps) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your loan assistant. Tell me about your loan needs. For example: 'I need ₦20,000 for business inventory to be repaid over 12 months' or 'Can I get a ₦15,000 loan for 6 months?'"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [analysis, setAnalysis] = useState<LoanAnalysis | null>(null);
  const [extractedData, setExtractedData] = useState<{
    loanAmount?: number;
    loanPurpose?: string;
    loanTermMonths?: number;
  }>({});
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const extractLoanIntent = async (userMessage: string) => {
    try {
      // Extract amount
      const amountMatch = userMessage.match(/₦?([\d,]+)(?:\s*(?:naira|NGN))?/i);
      const amount = amountMatch ? parseInt(amountMatch[1].replace(/,/g, '')) : null;

      // Extract months - handle both numeric and written forms
      let months = 12; // default
      const numericMonthMatch = userMessage.match(/(\d+)\s*months?/i);
      const writtenMonthMatch = userMessage.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s*months?/i);
      
      if (numericMonthMatch) {
        months = parseInt(numericMonthMatch[1]);
      } else if (writtenMonthMatch) {
        const monthWords: Record<string, number> = {
          one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
          seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12
        };
        months = monthWords[writtenMonthMatch[1].toLowerCase()] || 12;
      }

      // Extract purpose - clean and concise
      let purpose = userMessage
        .toLowerCase()
        .replace(/₦?[\d,]+(?:\s*(?:naira|NGN))?/gi, '')
        .replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s*months?/gi, '')
        .replace(/\d+\s*months?/gi, '')
        .replace(/\b(can|i|make|a|loan|get|need|want|request|apply|for|my|to|of|the|is|period)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (!purpose || purpose.length < 3) {
        purpose = "personal use";
      }

      return {
        loanAmount: amount,
        loanPurpose: purpose,
        loanTermMonths: months
      };
    } catch (error) {
      console.error("Error extracting intent:", error);
      return null;
    }
  };

  const analyzeLoanEligibility = async (loanAmount: number, loanPurpose: string, loanTermMonths: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('loan-agent', {
        body: {
          accountNumber,
          loanAmount,
          loanPurpose,
          loanTermMonths
        }
      });

      if (error) throw error;

      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
        
        // Add analysis result message
        const resultMessage = data.analysis.eligible
          ? `Great news! You're eligible for a loan. Based on your account history, I can approve up to ₦${data.analysis.max_loan_amount.toLocaleString()} at ${data.analysis.suggested_interest_rate}% annual interest rate.\n\n${data.analysis.reasoning}\n\nYour monthly payment would be approximately ₦${Math.round(data.analysis.monthly_payment).toLocaleString()}.`
          : `I've reviewed your application. Unfortunately, I cannot approve the requested loan amount at this time.\n\n${data.analysis.reasoning}`;

        setMessages(prev => [...prev, {
          role: "assistant",
          content: resultMessage
        }]);

        // Speak the analysis result if auto-speak is enabled
        if (autoSpeak) {
          await speakResponse(resultMessage);
        }

        if (data.analysis.recommendations && data.analysis.recommendations.length > 0) {
          const recoText = `Recommendations:\n${data.analysis.recommendations.map((r: string) => `• ${r}`).join('\n')}`;
          setMessages(prev => [...prev, {
            role: "assistant",
            content: recoText
          }]);

          // Speak recommendations if auto-speak is enabled
          if (autoSpeak) {
            await speakResponse(recoText);
          }
        }
      }
    } catch (error) {
      console.error("Error analyzing loan:", error);
      toast.error("Failed to analyze loan eligibility");
      const errorMsg = "I apologize, but I encountered an error analyzing your loan request. Please try again.";
      setMessages(prev => [...prev, {
        role: "assistant",
        content: errorMsg
      }]);
      
      // Speak the error message if auto-speak is enabled
      if (autoSpeak) {
        await speakResponse(errorMsg);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setInputText("");
    setIsLoading(true);

    try {
      // Extract loan details from user message
      const extracted = await extractLoanIntent(userMessage);
      
      if (!extracted || !extracted.loanAmount) {
        const errorMsg = "I couldn't understand the loan amount. Please specify the amount you need. For example: 'I need ₦20,000 for business'";
        setMessages(prev => [...prev, {
          role: "assistant",
          content: errorMsg
        }]);
        
        // Speak the error message if auto-speak is enabled
        if (autoSpeak) {
          await speakResponse(errorMsg);
        }
        return;
      }

      setExtractedData(extracted);

      // Analyze loan eligibility
      await analyzeLoanEligibility(
        extracted.loanAmount,
        extracted.loanPurpose || "General purpose",
        extracted.loanTermMonths || 12
      );

    } catch (error) {
      console.error("Error processing message:", error);
      toast.error("Failed to process your request");
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

  const handleProceedWithLoan = () => {
    if (!analysis || !analysis.eligible || !extractedData.loanAmount) {
      toast.error("Cannot proceed without approved loan");
      return;
    }

    // Navigate to confirmation with data
    navigate(`/loan-confirmation/${accountNumber}`, {
      state: {
        loanAmount: Math.min(extractedData.loanAmount, analysis.max_loan_amount),
        loanPurpose: extractedData.loanPurpose,
        loanTermMonths: extractedData.loanTermMonths,
        interestRate: analysis.suggested_interest_rate,
        monthlyPayment: analysis.monthly_payment,
        analysis: analysis
      }
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        await processVoiceInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Failed to start recording");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoiceInput = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const { data, error } = await supabase.functions.invoke('stt-agent', {
        body: formData,
      });

      if (error) throw error;

      if (data.text) {
        setInputText(data.text);
      }
    } catch (error) {
      console.error("Error processing voice:", error);
      toast.error("Failed to process voice input");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-b from-gray-950 to-black border-gray-800 overflow-hidden">
        {/* Voice Controls - Floating */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-black/70 backdrop-blur-lg rounded-full px-4 py-2 border border-gray-800">
          <Switch
            id="auto-speak"
            checked={autoSpeak}
            onCheckedChange={setAutoSpeak}
            className="scale-75"
          />
          <Label htmlFor="auto-speak" className="text-xs text-gray-300 cursor-pointer">
            Auto-speak
          </Label>
          {isSpeaking && (
            <Volume2 className="h-3 w-3 text-pink-500 animate-pulse" />
          )}
        </div>

        {/* Messages */}
        <ScrollArea className="h-[400px] p-4 md:p-6">
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
                  <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
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
      </Card>

      {analysis && (
        <Card className={`bg-gradient-to-br from-gray-900 to-gray-950 border-2 ${
          analysis.eligible ? "border-green-500/50" : "border-red-500/50"
        } backdrop-blur-lg`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              {analysis.eligible ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Loan Approved
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  Loan Not Approved
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Maximum Amount</p>
                <p className="text-xl font-bold text-white">₦{analysis.max_loan_amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Interest Rate</p>
                <p className="text-xl font-bold text-white">{analysis.suggested_interest_rate}% APR</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Approval Confidence</p>
                <div className="flex items-center gap-2">
                  <Badge variant={analysis.approval_confidence >= 70 ? "default" : "secondary"}>
                    {analysis.approval_confidence}%
                  </Badge>
                </div>
              </div>
              {analysis.eligible && (
                <div>
                  <p className="text-sm text-gray-400">Est. Monthly Payment</p>
                  <p className="text-xl font-bold text-white">₦{Math.round(analysis.monthly_payment).toLocaleString()}</p>
                </div>
              )}
            </div>

            {analysis.risk_factors && analysis.risk_factors.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2 text-white">Risk Factors:</p>
                <ul className="text-sm text-gray-400 space-y-1">
                  {analysis.risk_factors.map((factor, idx) => (
                    <li key={idx}>• {factor}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.eligible && (
              <Button onClick={handleProceedWithLoan} className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600" size="lg">
                Proceed with Loan Application
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-gray-800">
        <CardContent className="pt-6">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isRecording) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your loan request... (e.g., 'I need ₦20,000 for 12 months')"
                disabled={isLoading || isRecording}
                className="bg-gray-900 border-2 border-gray-800 focus:border-pink-500 text-white placeholder:text-gray-500 rounded-2xl h-14 pr-12 text-base transition-colors"
              />
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading}
                size="icon"
                variant="ghost"
                className={`absolute right-2 top-1/2 -translate-y-1/2 ${
                  isRecording ? "text-red-500 animate-pulse" : "text-gray-400 hover:text-white"
                }`}
              >
                <Mic className="h-5 w-5" />
              </Button>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading || isRecording}
              size="icon"
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 h-14 w-14 rounded-2xl shadow-lg"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoanChatInterface;
