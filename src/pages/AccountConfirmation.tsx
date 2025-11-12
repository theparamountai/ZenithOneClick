import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const AccountConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const accountData = location.state?.accountData;

  const [formData, setFormData] = useState({
    fullName: accountData?.fullName || '',
    gender: accountData?.gender || '',
    address: accountData?.address || '',
    ninNumber: accountData?.ninNumber || '',
    accountType: accountData?.accountType || 'savings',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate all fields
      if (!formData.fullName || !formData.gender || !formData.address || !formData.ninNumber || !formData.accountType) {
        throw new Error('All fields are required');
      }

      // Create account
      const { data, error } = await supabase.functions.invoke('generate-account', {
        body: formData
      });

      if (error) throw error;

      toast({
        title: "Account Created!",
        description: "Your account has been successfully created.",
      });

      // Navigate to account page
      setTimeout(() => {
        navigate(`/bank-account/${data.account.accountNumber}`);
      }, 2000);

    } catch (error) {
      console.error('Account creation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl">Confirm Your Information</CardTitle>
          <CardDescription>
            Please review and edit your information before creating your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Residential Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter your full residential address"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ninNumber">NIN Number</Label>
              <Input
                id="ninNumber"
                value={formData.ninNumber}
                onChange={(e) => setFormData({ ...formData, ninNumber: e.target.value })}
                placeholder="11-digit NIN"
                maxLength={11}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountType">Account Type</Label>
              <Select
                value={formData.accountType}
                onValueChange={(value) => setFormData({ ...formData, accountType: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="savings">Savings Account</SelectItem>
                  <SelectItem value="business">Business Account</SelectItem>
                  <SelectItem value="current">Current Account</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Confirm & Create Account'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountConfirmation;
