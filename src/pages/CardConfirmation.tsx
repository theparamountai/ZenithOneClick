import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUserAccounts } from "@/utils/accountValidation";

interface BankAccount {
  id: string;
  account_number: string;
  account_name: string;
  account_type: string;
  full_name: string;
  address: string;
  nin_number: string;
}

export default function CardConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cardType, currency, category } = location.state || {};

  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedCardType, setSelectedCardType] = useState(cardType || "visa");
  const [selectedCurrency, setSelectedCurrency] = useState(currency || "naira");
  const [selectedCategory, setSelectedCategory] = useState(category || "savings");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!cardType || !currency || !category) {
      toast.error("Invalid card request. Please try again.");
      navigate("/card-request");
      return;
    }

    loadAccounts();
  }, [cardType, currency, category, navigate]);

  const loadAccounts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const userAccounts = await getUserAccounts(user.id);
      setAccounts(userAccounts);
      
      if (userAccounts.length > 0) {
        setSelectedAccountId(userAccounts[0].id);
      }
    } catch (error) {
      console.error("Error loading accounts:", error);
      toast.error("Failed to load accounts");
    } finally {
      setIsLoading(false);
    }
  };

  const generateCardNumber = (type: string): string => {
    const prefix = type === "mastercard" ? "5" : type === "visa" ? "4" : "506";
    const remaining = 16 - prefix.length;
    let number = prefix;
    for (let i = 0; i < remaining; i++) {
      number += Math.floor(Math.random() * 10);
    }
    return number;
  };

  const generateCVV = (): string => {
    return Math.floor(100 + Math.random() * 900).toString();
  };

  const generateExpiryDate = (): string => {
    const now = new Date();
    const expiryDate = new Date(now.setFullYear(now.getFullYear() + 3));
    const month = (expiryDate.getMonth() + 1).toString().padStart(2, '0');
    const year = expiryDate.getFullYear().toString().slice(-2);
    return `${month}/${year}`;
  };

  const handleCreateCard = async () => {
    if (!selectedAccountId) {
      toast.error("Please select an account");
      return;
    }

    setIsCreating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);
      if (!selectedAccount) throw new Error("Account not found");

      const cardData = {
        user_id: user.id,
        account_id: selectedAccountId,
        card_number: generateCardNumber(selectedCardType),
        card_type: selectedCardType,
        currency: selectedCurrency,
        category: selectedCategory,
        cvv: generateCVV(),
        expiry_date: generateExpiryDate(),
        card_holder_name: selectedAccount.full_name,
        status: "active",
        is_physical: false
      };

      const { error } = await supabase
        .from("bank_cards")
        .insert(cardData);

      if (error) throw error;

      toast.success("Card created successfully!");
      navigate("/my-cards");

    } catch (error) {
      console.error("Error creating card:", error);
      toast.error("Failed to create card. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/card-request")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Confirm Card Details</h1>
            <p className="text-sm text-muted-foreground">Review and confirm your card request</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your bank account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Select Account</Label>
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.account_name} - {account.account_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedAccount && (
                <>
                  <div>
                    <Label>Full Name</Label>
                    <div className="p-2 bg-muted rounded-md">{selectedAccount.full_name}</div>
                  </div>
                  <div>
                    <Label>Account Type</Label>
                    <div className="p-2 bg-muted rounded-md capitalize">{selectedAccount.account_type}</div>
                  </div>
                  <div>
                    <Label>Address</Label>
                    <div className="p-2 bg-muted rounded-md">{selectedAccount.address}</div>
                  </div>
                  <div>
                    <Label>NIN Number</Label>
                    <div className="p-2 bg-muted rounded-md">{selectedAccount.nin_number}</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Card Details</CardTitle>
              <CardDescription>Customize your card preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Card Type</Label>
                <Select value={selectedCardType} onValueChange={setSelectedCardType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mastercard">Mastercard</SelectItem>
                    <SelectItem value="visa">Visa</SelectItem>
                    <SelectItem value="verve">Verve</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Currency</Label>
                <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="naira">Naira (₦)</SelectItem>
                    <SelectItem value="dollar">Dollar ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="current">Current</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate("/card-request")} className="flex-1">
              Go Back
            </Button>
            <Button onClick={handleCreateCard} disabled={isCreating} className="flex-1">
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Confirm and Create Card"
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
