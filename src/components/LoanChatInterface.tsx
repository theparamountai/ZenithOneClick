import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Send, Loader2, CheckCircle, XCircle, TrendingUp, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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

        if (data.analysis.recommendations && data.analysis.recommendations.length > 0) {
          setMessages(prev => [...prev, {
            role: "assistant",
            content: `Recommendations:\n${data.analysis.recommendations.map((r: string) => `• ${r}`).join('\n')}`
          }]);
        }
      }
    } catch (error) {
      console.error("Error analyzing loan:", error);
      toast.error("Failed to analyze loan eligibility");
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I apologize, but I encountered an error analyzing your loan request. Please try again."
      }]);
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
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "I couldn't understand the loan amount. Please specify the amount you need. For example: 'I need ₦20,000 for business'"
        }]);
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
      <Card className="max-h-[500px] overflow-y-auto">
        <CardContent className="pt-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
      </Card>

      {analysis && (
        <Card className={analysis.eligible ? "border-green-500" : "border-destructive"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {analysis.eligible ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Loan Approved
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-destructive" />
                  Loan Not Approved
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Maximum Amount</p>
                <p className="text-xl font-bold">₦{analysis.max_loan_amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Interest Rate</p>
                <p className="text-xl font-bold">{analysis.suggested_interest_rate}% APR</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approval Confidence</p>
                <div className="flex items-center gap-2">
                  <Badge variant={analysis.approval_confidence >= 70 ? "default" : "secondary"}>
                    {analysis.approval_confidence}%
                  </Badge>
                </div>
              </div>
              {analysis.eligible && (
                <div>
                  <p className="text-sm text-muted-foreground">Est. Monthly Payment</p>
                  <p className="text-xl font-bold">₦{Math.round(analysis.monthly_payment).toLocaleString()}</p>
                </div>
              )}
            </div>

            {analysis.risk_factors && analysis.risk_factors.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">Risk Factors:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {analysis.risk_factors.map((factor, idx) => (
                    <li key={idx}>• {factor}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.eligible && (
              <Button onClick={handleProceedWithLoan} className="w-full" size="lg">
                Proceed with Loan Application
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your loan request here... (e.g., 'I need ₦20,000 for business inventory for 12 months')"
              className="min-h-[100px]"
              disabled={isLoading}
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant="outline"
              disabled={isLoading}
            >
              <Mic className={`h-4 w-4 mr-2 ${isRecording ? 'text-red-500' : ''}`} />
              {isRecording ? "Stop Recording" : "Voice Input"}
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoanChatInterface;
