import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    ssnLastFour: "",
    phone: "",
    email: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    residenceType: "",
    yearsAtAddress: "",
    employmentStatus: "",
    employerName: "",
    jobTitle: "",
    annualIncome: "",
    employmentDuration: "",
    existingChecking: false,
    existingSavings: false,
    existingCreditCards: 0,
    monthlyExpenses: "",
    bankingGoal: "",
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No user found");

      const { error } = await supabase.from("profiles").insert({
        id: user.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        date_of_birth: formData.dateOfBirth,
        ssn_last_four: formData.ssnLastFour,
        phone: formData.phone,
        email: formData.email,
        street_address: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        residence_type: formData.residenceType,
        years_at_address: formData.yearsAtAddress,
        employment_status: formData.employmentStatus,
        employer_name: formData.employerName,
        job_title: formData.jobTitle,
        annual_income: parseFloat(formData.annualIncome),
        employment_duration: formData.employmentDuration,
        existing_checking: formData.existingChecking,
        existing_savings: formData.existingSavings,
        existing_credit_cards: formData.existingCreditCards,
        monthly_expenses: parseFloat(formData.monthlyExpenses),
        banking_goal: formData.bankingGoal,
        onboarding_completed: true,
      });

      if (error) throw error;

      toast({
        title: "Profile completed!",
        description: "Welcome to One Click Financial Hub",
      });

      navigate("/dashboard");
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

  const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              Fill out this information once, and we'll handle the rest
            </CardDescription>
            <Progress value={(step / totalSteps) * 100} className="mt-4" />
            <p className="text-sm text-muted-foreground mt-2">
              Step {step} of {totalSteps}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateField("dateOfBirth", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ssnLastFour">Last 4 digits of SSN</Label>
                  <Input
                    id="ssnLastFour"
                    maxLength={4}
                    pattern="[0-9]{4}"
                    value={formData.ssnLastFour}
                    onChange={(e) => updateField("ssnLastFour", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Address Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="streetAddress">Street Address</Label>
                  <Input
                    id="streetAddress"
                    value={formData.streetAddress}
                    onChange={(e) => updateField("streetAddress", e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => updateField("state", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => updateField("zipCode", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="residenceType">Residence Type</Label>
                  <Select value={formData.residenceType} onValueChange={(value) => updateField("residenceType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select residence type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="own">Own</SelectItem>
                      <SelectItem value="rent">Rent</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearsAtAddress">Years at Address</Label>
                  <Input
                    id="yearsAtAddress"
                    value={formData.yearsAtAddress}
                    onChange={(e) => updateField("yearsAtAddress", e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Employment & Income</h3>
                <div className="space-y-2">
                  <Label htmlFor="employmentStatus">Employment Status</Label>
                  <Select value={formData.employmentStatus} onValueChange={(value) => updateField("employmentStatus", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employed">Employed</SelectItem>
                      <SelectItem value="self-employed">Self-Employed</SelectItem>
                      <SelectItem value="unemployed">Unemployed</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(formData.employmentStatus === "employed" || formData.employmentStatus === "self-employed") && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="employerName">Employer Name</Label>
                      <Input
                        id="employerName"
                        value={formData.employerName}
                        onChange={(e) => updateField("employerName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input
                        id="jobTitle"
                        value={formData.jobTitle}
                        onChange={(e) => updateField("jobTitle", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employmentDuration">Employment Duration</Label>
                      <Input
                        id="employmentDuration"
                        placeholder="e.g., 2 years"
                        value={formData.employmentDuration}
                        onChange={(e) => updateField("employmentDuration", e.target.value)}
                      />
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label htmlFor="annualIncome">Annual Income</Label>
                  <Input
                    id="annualIncome"
                    type="number"
                    placeholder="50000"
                    value={formData.annualIncome}
                    onChange={(e) => updateField("annualIncome", e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Financial Profile</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="existingChecking"
                      checked={formData.existingChecking}
                      onChange={(e) => updateField("existingChecking", e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="existingChecking">I have an existing checking account</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="existingSavings"
                      checked={formData.existingSavings}
                      onChange={(e) => updateField("existingSavings", e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="existingSavings">I have an existing savings account</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="existingCreditCards">Number of Credit Cards</Label>
                  <Input
                    id="existingCreditCards"
                    type="number"
                    min="0"
                    value={formData.existingCreditCards}
                    onChange={(e) => updateField("existingCreditCards", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyExpenses">Estimated Monthly Expenses</Label>
                  <Input
                    id="monthlyExpenses"
                    type="number"
                    placeholder="2000"
                    value={formData.monthlyExpenses}
                    onChange={(e) => updateField("monthlyExpenses", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankingGoal">Primary Banking Goal</Label>
                  <Select value={formData.bankingGoal} onValueChange={(value) => updateField("bankingGoal", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="save-money">Save Money</SelectItem>
                      <SelectItem value="build-credit">Build Credit</SelectItem>
                      <SelectItem value="get-loan">Get a Loan</SelectItem>
                      <SelectItem value="manage-finances">Manage Finances</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Review & Submit</h3>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">Name:</div>
                    <div>{formData.firstName} {formData.lastName}</div>
                    <div className="font-medium">Email:</div>
                    <div>{formData.email}</div>
                    <div className="font-medium">Phone:</div>
                    <div>{formData.phone}</div>
                    <div className="font-medium">Address:</div>
                    <div>{formData.streetAddress}, {formData.city}, {formData.state} {formData.zipCode}</div>
                    <div className="font-medium">Employment:</div>
                    <div>{formData.employmentStatus}</div>
                    <div className="font-medium">Annual Income:</div>
                    <div>₦{parseFloat(formData.annualIncome || "0").toLocaleString()}</div>
                  </div>
                </div>
                <div className="space-y-2 pt-4">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="terms" required className="h-4 w-4" />
                    <Label htmlFor="terms">I agree to the Terms of Service and Privacy Policy</Label>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous
                </Button>
              )}
              {step < totalSteps ? (
                <Button type="button" onClick={nextStep} className="ml-auto">
                  Next
                </Button>
              ) : (
                <Button type="button" onClick={handleSubmit} disabled={loading} className="ml-auto">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;