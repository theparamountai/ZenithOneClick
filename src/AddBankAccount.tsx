import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

const AddBankAccount = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Add a Bank Account</h1>
          <p className="text-muted-foreground">
            Connect external bank accounts to view all your finances in one place
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* OPay Card */}
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-700 border-none text-white hover:scale-105 transition-transform cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Building2 className="w-6 h-6" />
                </div>
                <CardTitle className="text-white">OPay</CardTitle>
              </div>
              <CardDescription className="text-white/90">
                Connect your OPay merchant account to view balance and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="secondary"
                className="w-full bg-white text-emerald-700 hover:bg-white/90"
                onClick={() => navigate('/connect-opay')}
              >
                Connect OPay →
              </Button>
            </CardContent>
          </Card>

          {/* Coming Soon - Other Banks */}
          <Card className="border-2 border-dashed border-border relative overflow-hidden opacity-60">
            <div className="absolute top-4 right-4">
              <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-muted-foreground" />
                </div>
                <CardTitle className="text-foreground">More Banks</CardTitle>
              </div>
              <CardDescription>
                GTBank, Access Bank, First Bank, and more coming soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" disabled className="w-full">
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddBankAccount;
