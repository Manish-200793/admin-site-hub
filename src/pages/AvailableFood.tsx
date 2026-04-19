import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Loader2, HandHelping } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const AvailableFood = () => {
  const { user, isReceiver } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("food_listings")
        .select("*")
        .eq("status", "available")
        .gte("expires_at", new Date().toISOString())
        .order("expires_at", { ascending: true });
      setListings(data ?? []);
      setLoading(false);
    })();
  }, []);

  const handleRequest = async (listingId: string) => {
    if (!user) return;
    const { error } = await supabase.from("food_requests").insert({
      listing_id: listingId,
      receiver_id: user.id,
      people_count: 1,
      urgency: "medium",
    });
    if (error) toast.error(error.message);
    else toast.success("Request sent to donor!");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="container py-10 flex-1">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-semibold">Available food near you</h1>
          <p className="text-muted-foreground mt-1">Fresh listings, prioritized by expiry time.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : listings.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border/60 p-12 text-center text-muted-foreground">
            No food listings available right now. Check back soon.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((l) => (
              <div key={l.id} className="bg-card rounded-2xl border border-border/60 p-6 shadow-card hover:shadow-earth transition-smooth flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-display text-xl font-semibold">{l.food_name}</h3>
                  <Badge className="bg-accent-soft text-accent border-0">{l.quantity} {l.unit}</Badge>
                </div>
                {l.description && <p className="text-sm text-muted-foreground mb-4">{l.description}</p>}
                <div className="space-y-1.5 text-sm text-muted-foreground mt-auto">
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {l.pickup_address}</div>
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-accent" /> by {new Date(l.expires_at).toLocaleString()}</div>
                </div>
                {user && isReceiver ? (
                  <Button className="mt-4 bg-gradient-warm shadow-warm" onClick={() => handleRequest(l.id)}>
                    <HandHelping className="h-4 w-4 mr-2" /> Request this
                  </Button>
                ) : !user ? (
                  <Button asChild variant="outline" className="mt-4">
                    <Link to="/auth?mode=signup&role=receiver">Sign in to request</Link>
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AvailableFood;
