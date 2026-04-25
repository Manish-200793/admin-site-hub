import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { Sprout, Loader2, Heart, HandHelping, Mail, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Name is too short").max(80),
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(8, "Min 8 characters").max(72),
  phone: z.string().trim().max(20).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(1, "Required"),
});

const Auth = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const [tab, setTab] = useState(params.get("mode") === "signup" ? "signup" : "login");
  const [role, setRole] = useState<"donor" | "receiver">(
    (params.get("role") as "donor" | "receiver") || "receiver"
  );
  const [loading, setLoading] = useState(false);

  // OTP / email-code login
  const [otpEmail, setOtpEmail] = useState("");
  const [otpStep, setOtpStep] = useState<"email" | "code">("email");
  const [otpCode, setOtpCode] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = signupSchema.safeParse({
      fullName: fd.get("fullName"),
      email: fd.get("email"),
      password: fd.get("password"),
      phone: fd.get("phone") || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: parsed.data.fullName,
          phone: parsed.data.phone ?? "",
          role, // donor or receiver — never admin
        },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome to ZeroHunger.AI!");
    navigate("/dashboard");
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = loginSchema.safeParse({ email: fd.get("email"), password: fd.get("password") });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back!");
    navigate("/dashboard");
  };

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = otpEmail.trim();
    if (!z.string().email().safeParse(email).success) {
      toast.error("Enter a valid email");
      return;
    }
    setOtpSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setOtpSending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Code sent — check your inbox");
    setOtpStep("code");
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      toast.error("Enter the 6-digit code");
      return;
    }
    setOtpVerifying(true);
    const { error } = await supabase.auth.verifyOtp({
      email: otpEmail.trim(),
      token: otpCode,
      type: "email",
    });
    setOtpVerifying(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed in!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-earth text-primary-foreground shadow-earth">
            <Sprout className="h-5 w-5" />
          </span>
          <span className="font-display text-2xl font-semibold">ZeroHunger<span className="text-accent">.AI</span></span>
        </Link>

        <div className="bg-card rounded-2xl shadow-soft border border-border/60 p-7">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6 w-full">
              <TabsTrigger value="login">Password</TabsTrigger>
              <TabsTrigger value="otp">Email code</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="li-email">Email</Label>
                  <Input id="li-email" name="email" type="email" required autoComplete="email" />
                </div>
                <div>
                  <Label htmlFor="li-password">Password</Label>
                  <Input id="li-password" name="password" type="password" required autoComplete="current-password" />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-gradient-warm shadow-warm">
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Sign in
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="otp">
              {otpStep === "email" ? (
                <form onSubmit={sendOtp} className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    We'll email you a 6-digit code. No password needed.
                  </p>
                  <div>
                    <Label htmlFor="otp-email">Email</Label>
                    <Input
                      id="otp-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={otpSending} className="w-full bg-gradient-warm shadow-warm">
                    {otpSending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
                    Send code
                  </Button>
                </form>
              ) : (
                <form onSubmit={verifyOtp} className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code sent to <span className="text-foreground font-medium">{otpEmail}</span>
                  </p>
                  <div className="flex justify-center py-2">
                    <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <Button type="submit" disabled={otpVerifying || otpCode.length !== 6} className="w-full bg-gradient-warm shadow-warm">
                    {otpVerifying ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <KeyRound className="h-4 w-4 mr-2" />}
                    Verify & sign in
                  </Button>
                  <button
                    type="button"
                    onClick={() => { setOtpStep("email"); setOtpCode(""); }}
                    className="text-xs text-muted-foreground hover:text-foreground w-full text-center"
                  >
                    Use a different email
                  </button>
                </form>
              )}
            </TabsContent>

            <TabsContent value="signup">
              <div className="grid grid-cols-2 gap-2 mb-5">
                <button
                  type="button"
                  onClick={() => setRole("donor")}
                  className={`p-3 rounded-xl border transition-smooth text-left ${
                    role === "donor" ? "border-accent bg-accent-soft" : "border-border hover:border-accent/50"
                  }`}
                >
                  <Heart className="h-4 w-4 text-accent mb-1" />
                  <div className="text-sm font-semibold">I'm a donor</div>
                  <div className="text-xs text-muted-foreground">Share surplus food</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("receiver")}
                  className={`p-3 rounded-xl border transition-smooth text-left ${
                    role === "receiver" ? "border-accent bg-accent-soft" : "border-border hover:border-accent/50"
                  }`}
                >
                  <HandHelping className="h-4 w-4 text-accent mb-1" />
                  <div className="text-sm font-semibold">I need food</div>
                  <div className="text-xs text-muted-foreground">Request meals</div>
                </button>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <Label htmlFor="su-name">Full name</Label>
                  <Input id="su-name" name="fullName" required />
                </div>
                <div>
                  <Label htmlFor="su-email">Email</Label>
                  <Input id="su-email" name="email" type="email" required autoComplete="email" />
                </div>
                <div>
                  <Label htmlFor="su-phone">Phone (optional)</Label>
                  <Input id="su-phone" name="phone" type="tel" />
                </div>
                <div>
                  <Label htmlFor="su-password">Password</Label>
                  <Input id="su-password" name="password" type="password" required minLength={8} autoComplete="new-password" />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-gradient-warm shadow-warm">
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Are you an administrator? <Link to="/admin/login" className="text-accent hover:underline">Use the admin portal</Link>
        </p>
      </div>
    </div>
  );
};

export default Auth;
