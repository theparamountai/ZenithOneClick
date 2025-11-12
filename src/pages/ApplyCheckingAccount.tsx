import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Building2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ApplyCheckingAccount = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    initialDeposit: 0,
    overdraftProtection: true,
    debitCardPreference: "",
  });

  useEffect(() => {
    const fetchProfileAndGenerate = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        const { data: aiData, error: aiError } = await supabase.functions.invoke(
          "generate-application",
          {
            body: { productType: "checking_account", profile },
          }
        );

        if (aiError) throw aiError;

        setFormData({
          firstName: profile.first_name,
          lastName: profile.last_name,
          email: profile.email,
          phone: profile.phone,
          address: `${profile.street_address}, ${profile.city}, ${profile.state} ${profile.zip_code}`,
          initialDeposit: aiData.data.initialDeposit,
          overdraftProtection: aiData.data.overdraftProtection,
          debitCardPreference: aiData.data.debitCardPreference,
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndGenerate();
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase.from("applications").insert({
        user_id: user.id,
        product_type: "checking_account",
        application_data: formData,
        status: "pending",
      });

      if (error) throw error;

      setShowSuccess(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-6">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Checking Account Application</CardTitle>
                <CardDescription>
                  Review and confirm your pre-filled application
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="initialDeposit">Initial Deposit Amount (₦)</Label>
                <Input
                  id="initialDeposit"
                  type="number"
                  value={formData.initialDeposit}
                  onChange={(e) => setFormData({ ...formData, initialDeposit: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="overdraftProtection"
                    checked={formData.overdraftProtection}
                    onChange={(e) => setFormData({ ...formData, overdraftProtection: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="overdraftProtection">Enable Overdraft Protection</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="debitCardPreference">Debit Card Preference</Label>
                <Select value={formData.debitCardPreference} onValueChange={(value) => setFormData({ ...formData, debitCardPreference: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="contactless">Contactless</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate("/dashboard")} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Application
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Application Submitted!</DialogTitle>
            <DialogDescription className="space-y-2 pt-4">
              <p>Your checking account application has been successfully submitted.</p>
              <p>You will receive an email when your application is processed.</p>
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => navigate("/dashboard")}>Return to Dashboard</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplyCheckingAccount;