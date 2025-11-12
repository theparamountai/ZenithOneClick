import { useNavigate } from "react-router-dom";
import { MessageSquare, Mic, Circle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const OnboardingChoice = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Smart Account Opening
          </h1>
          <p className="text-xl text-muted-foreground">
            Swiftly open an account
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Quick Account Opening */}
          <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Mic className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">Quick Account Opening</CardTitle>
              <CardDescription className="text-base">
                Open your account in seconds with our AI-powered chat
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-foreground">Chat with AI agent to open account in seconds</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-foreground">Talk to AI agent to swiftly onboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-foreground">Text or voice - your choice</span>
                </li>
              </ul>
              <Button 
                onClick={() => navigate('/quick-account')}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
              >
                Start Quick Chat
              </Button>
            </CardContent>
          </Card>

          {/* Swift Full Account Opening */}
          <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Circle className="h-8 w-8 text-primary fill-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">Swift Full Account Opening</CardTitle>
              <CardDescription className="text-base">
                Hands-free account opening with voice conversation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-foreground">Talk to AI agent for full account opening</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-foreground">No need to stress by typing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-foreground">Hands-free experience</span>
                </li>
              </ul>
              <Button 
                onClick={() => navigate('/voice-account')}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
              >
                Start Conversation
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="text-muted-foreground hover:text-foreground"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingChoice;
