import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Eye, EyeOff, Plus, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BankCard {
  id: string;
  card_number: string;
  card_type: string;
  currency: string;
  category: string;
  cvv: string;
  expiry_date: string;
  card_holder_name: string;
  status: string;
  is_physical: boolean;
}

export default function MyCards() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<BankCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCvv, setVisibleCvv] = useState<{ [key: string]: boolean }>({});
  const [visibleCardNumber, setVisibleCardNumber] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("bank_cards")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCards(data || []);
    } catch (error) {
      console.error("Error loading cards:", error);
      toast.error("Failed to load cards");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCvvVisibility = (cardId: string) => {
    setVisibleCvv(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const toggleCardNumberVisibility = (cardId: string) => {
    setVisibleCardNumber(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const formatCardNumber = (number: string): string => {
    return number.replace(/(\d{4})/g, "$1 ").trim();
  };

  const maskCardNumber = (number: string): string => {
    return "•••• •••• •••• " + number.slice(-4);
  };

  const getCardGradient = (type: string): string => {
    switch (type) {
      case "mastercard":
        return "bg-gradient-to-br from-red-500 to-red-700";
      case "visa":
        return "bg-gradient-to-br from-red-400 to-red-600";
      case "verve":
        return "bg-gradient-to-br from-red-600 to-red-800";
      default:
        return "bg-gradient-to-br from-red-500 to-red-700";
    }
  };

  const handleBlockCard = async (cardId: string) => {
    try {
      const { error } = await supabase
        .from("bank_cards")
        .update({ status: "blocked" })
        .eq("id", cardId);

      if (error) throw error;
      toast.success("Card blocked successfully");
      loadCards();
    } catch (error) {
      console.error("Error blocking card:", error);
      toast.error("Failed to block card");
    }
  };

  const handleUnblockCard = async (cardId: string) => {
    try {
      const { error } = await supabase
        .from("bank_cards")
        .update({ status: "active" })
        .eq("id", cardId);

      if (error) throw error;
      toast.success("Card unblocked successfully");
      loadCards();
    } catch (error) {
      console.error("Error unblocking card:", error);
      toast.error("Failed to unblock card");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">My Cards</h1>
              <p className="text-sm text-muted-foreground">Manage your debit cards</p>
            </div>
          </div>
          <Button onClick={() => navigate("/card-request")}>
            <Plus className="h-4 w-4 mr-2" />
            Request New Card
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {cards.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">No Cards Yet</h2>
            <p className="text-muted-foreground mb-6">
              You don't have any cards yet. Request your first card to get started.
            </p>
            <Button onClick={() => navigate("/card-request")}>
              <Plus className="h-4 w-4 mr-2" />
              Request Your First Card
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <Card key={card.id} className="overflow-hidden">
                  <div className={`${getCardGradient(card.card_type)} text-white p-6 aspect-[1.6/1] relative`}>
                    <div className="flex justify-between items-start mb-8">
                      <div className="text-sm font-medium">
                        <div className="capitalize">{card.category} Account</div>
                        <div className="text-xs opacity-90">
                          {card.currency === "naira" ? "₦ Naira" : "$ Dollar"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold capitalize">{card.card_type}</div>
                        {card.status === "blocked" && (
                          <Badge variant="destructive" className="mt-1">Blocked</Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="font-mono text-lg tracking-wider">
                          {visibleCardNumber[card.id] 
                            ? formatCardNumber(card.card_number)
                            : maskCardNumber(card.card_number)
                          }
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCardNumberVisibility(card.id)}
                          className="text-white hover:bg-white/20"
                        >
                          {visibleCardNumber[card.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-xs opacity-80 mb-1">Card Holder</div>
                          <div className="text-sm font-medium">{card.card_holder_name}</div>
                        </div>
                        <div>
                          <div className="text-xs opacity-80 mb-1">Expires</div>
                          <div className="text-sm font-medium">{card.expiry_date}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">CVV</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">
                          {visibleCvv[card.id] ? card.cvv : "•••"}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCvvVisibility(card.id)}
                        >
                          {visibleCvv[card.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {card.status === "active" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBlockCard(card.id)}
                          className="flex-1"
                        >
                          <Lock className="h-4 w-4 mr-1" />
                          Block Card
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnblockCard(card.id)}
                          className="flex-1"
                        >
                          <Unlock className="h-4 w-4 mr-1" />
                          Unblock Card
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => toast.info("Physical card request coming soon!")}
              >
                Request For Physical Card
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
