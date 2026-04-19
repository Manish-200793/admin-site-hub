import { Link, useNavigate } from "react-router-dom";
import { Sprout, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export const Navbar = () => {
  const { user, signOut, isDonor, isReceiver } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-earth text-primary-foreground shadow-earth transition-smooth group-hover:scale-105">
            <Sprout className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">
            ZeroHunger<span className="text-accent">.AI</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="/#how" className="hover:text-foreground transition-smooth">How it works</a>
          <a href="/#impact" className="hover:text-foreground transition-smooth">Impact</a>
          <Link to="/available-food" className="hover:text-foreground transition-smooth">Available food</Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button variant="outline" size="sm" onClick={async () => { await signOut(); navigate("/"); }}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>Sign in</Button>
              <Button size="sm" className="bg-gradient-warm shadow-warm" onClick={() => navigate("/auth?mode=signup")}>
                Join us
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
