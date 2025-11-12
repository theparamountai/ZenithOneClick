import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const navItems = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "AI Features", href: "#ai-features" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-glow">
              <span className="text-white text-lg font-bold">Z</span>
            </div>
            <span className="text-xl font-bold text-foreground">Zenith One-Click</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 hover:text-primary">
                    <User className="h-4 w-4" />
                    <span>{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>Dashboard</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/auth")} className="hover:text-primary">
                  Sign In
                </Button>
                <Button onClick={() => navigate("/auth")} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Get Started
                </Button>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-in slide-in-from-top-4">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-muted-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {user ? (
                  <>
                    <Button
                      onClick={() => {
                        navigate("/dashboard");
                        setIsOpen(false);
                      }}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Dashboard
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        handleSignOut();
                        setIsOpen(false);
                      }}
                      className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => {
                        navigate("/auth");
                        setIsOpen(false);
                      }}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Get Started
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate("/auth");
                        setIsOpen(false);
                      }}
                      className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      Sign In
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
