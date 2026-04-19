import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading, signOut, refreshRoles } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("admin-theme");
    return () => document.documentElement.classList.remove("admin-theme");
  }, []);

  useEffect(() => {
    if (!authLoading && user && isAdmin) navigate("/admin", { replace: true });
  }, [user, isAdmin, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email"));
    const password = String(fd.get("password"));

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }

    // Verify admin role server-side
    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();

    setLoading(false);

    if (!rolesData) {
      await supabase.auth.signOut();
      toast.error("This account does not have admin access.");
      return;
    }

    await refreshRoles();
    toast.success("Welcome, admin.");
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-earth opacity-40" />
      <div className="absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />

      <div className="relative w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-smooth">
          <ArrowLeft className="h-4 w-4" /> Back to public site
        </Link>

        <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-soft border border-border/60 p-8">
          <div className="flex flex-col items-center text-center mb-7">
            <div className="h-14 w-14 rounded-2xl bg-gradient-warm flex items-center justify-center shadow-warm mb-4">
              <Shield className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="font-display text-2xl font-semibold">Admin Portal</h1>
            <p className="text-sm text-muted-foreground mt-1">Restricted access. Authorized administrators only.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="admin-email">Admin email</Label>
              <Input id="admin-email" name="email" type="email" required autoComplete="email" />
            </div>
            <div>
              <Label htmlFor="admin-password">Password</Label>
              <Input id="admin-password" name="password" type="password" required autoComplete="current-password" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-warm shadow-warm h-11">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enter portal
            </Button>
          </form>

          {user && !isAdmin && (
            <div className="mt-5 p-3 bg-destructive/10 text-destructive rounded-lg text-xs">
              You're signed in but don't have admin access.{" "}
              <button onClick={signOut} className="underline">Sign out</button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Need a regular account? <Link to="/auth" className="text-accent hover:underline">Sign in here</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
