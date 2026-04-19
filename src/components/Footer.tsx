import { Sprout } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => (
  <footer className="border-t border-border/60 bg-secondary/40 mt-24">
    <div className="container py-12 grid gap-8 md:grid-cols-4">
      <div className="md:col-span-2 space-y-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-earth text-primary-foreground">
            <Sprout className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-semibold">ZeroHunger<span className="text-accent">.AI</span></span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md">
          An AI-driven Smart Food Security System that connects surplus food with people who need it most — quickly, fairly, and locally.
        </p>
      </div>
      <div>
        <h4 className="font-display text-sm font-semibold mb-3">Platform</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><Link to="/auth?mode=signup&role=donor" className="hover:text-foreground">Become a donor</Link></li>
          <li><Link to="/auth?mode=signup&role=receiver" className="hover:text-foreground">Request food</Link></li>
          <li><Link to="/available-food" className="hover:text-foreground">Available food</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-display text-sm font-semibold mb-3">Restricted</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><Link to="/admin/login" className="hover:text-foreground">Admin portal</Link></li>
        </ul>
      </div>
    </div>
    <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} ZeroHunger.AI — Built with care for a hunger-free world.
    </div>
  </footer>
);
