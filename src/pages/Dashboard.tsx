import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Heart, HandHelping, MapPin, Clock, Loader2, Plus, Check, X, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ChatBox } from "@/components/ChatBox";

interface Listing {
  id: string;
  food_name: string;
  description: string | null;
  quantity: number;
  unit: string;
  pickup_address: string;
  expires_at: string;
  status: string;
  created_at: string;
}

const Dashboard = () => {
  const { user, isDonor, isReceiver, roles } = useAuth();
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    if (isDonor) {
      const { data } = await supabase
        .from("food_listings")
        .select("*")
        .eq("donor_id", user.id)
        .order("created_at", { ascending: false });
      setMyListings((data ?? []) as Listing[]);
    }
    if (isReceiver) {
      const { data } = await supabase
        .from("food_requests")
        .select("*, food_listings(food_name, pickup_address)")
        .eq("receiver_id", user.id)
        .order("created_at", { ascending: false });
      setMyRequests(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user, isDonor, isReceiver]);

  const handleAddListing = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    const { error } = await supabase.from("food_listings").insert({
      donor_id: user.id,
      food_name: String(fd.get("food_name")),
      description: String(fd.get("description") || ""),
      quantity: Number(fd.get("quantity")),
      unit: String(fd.get("unit") || "servings"),
      pickup_address: String(fd.get("pickup_address")),
      expires_at: new Date(String(fd.get("expires_at"))).toISOString(),
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Listing posted!");
    (e.target as HTMLFormElement).reset();
    load();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="container py-10 flex-1">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back. {roles.length > 0 && <>You're signed in as <Badge variant="secondary" className="ml-1">{roles.join(", ")}</Badge></>}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {isDonor && (
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl border border-border/60 shadow-card p-6 sticky top-20">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="h-5 w-5 text-accent" />
                  <h2 className="font-display text-xl font-semibold">Donate food</h2>
                </div>
                <form onSubmit={handleAddListing} className="space-y-3">
                  <div>
                    <Label htmlFor="food_name">Food name</Label>
                    <Input id="food_name" name="food_name" required maxLength={120} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input id="quantity" name="quantity" type="number" min="1" required />
                    </div>
                    <div>
                      <Label htmlFor="unit">Unit</Label>
                      <Input id="unit" name="unit" defaultValue="servings" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="pickup_address">Pickup address</Label>
                    <Input id="pickup_address" name="pickup_address" required />
                  </div>
                  <div>
                    <Label htmlFor="expires_at">Expires at</Label>
                    <Input id="expires_at" name="expires_at" type="datetime-local" required />
                  </div>
                  <div>
                    <Label htmlFor="description">Notes</Label>
                    <Textarea id="description" name="description" rows={2} />
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full bg-gradient-warm shadow-warm">
                    {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                    Post listing
                  </Button>
                </form>
              </div>
            </div>
          )}

          <div className={isDonor ? "lg:col-span-2" : "lg:col-span-3"}>
            {isReceiver && (
              <div className="bg-gradient-earth rounded-2xl p-6 text-primary-foreground mb-6 flex items-center justify-between shadow-earth">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <HandHelping className="h-5 w-5 text-amber" />
                    <h3 className="font-display text-xl font-semibold">Need a meal?</h3>
                  </div>
                  <p className="text-sm text-primary-foreground/80">Browse food shared by donors near you.</p>
                </div>
                <Button asChild className="bg-amber text-amber-foreground hover:bg-amber/90">
                  <Link to="/available-food">Browse food</Link>
                </Button>
              </div>
            )}

            {isDonor && (
              <>
                <h2 className="font-display text-2xl font-semibold mb-4">Your listings</h2>
                {loading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : myListings.length === 0 ? (
                  <div className="text-muted-foreground bg-card rounded-2xl border border-border/60 p-8 text-center">
                    No listings yet — share your first surplus meal on the left.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myListings.map((l) => (
                      <ListingRow key={l.id} listing={l} />
                    ))}
                  </div>
                )}
              </>
            )}

            {isReceiver && (
              <>
                <h2 className="font-display text-2xl font-semibold mb-4 mt-8">Your requests</h2>
                {loading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : myRequests.length === 0 ? (
                  <div className="text-muted-foreground bg-card rounded-2xl border border-border/60 p-8 text-center">
                    You haven't requested any food yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myRequests.map((r) => (
                      <div key={r.id} className="bg-card rounded-xl border border-border/60 p-4 shadow-card">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold">{r.food_listings?.food_name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" /> {r.food_listings?.pickup_address}
                            </div>
                          </div>
                          <Badge variant={r.status === "approved" ? "default" : "secondary"}>{r.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const ListingRow = ({ listing }: { listing: Listing }) => (
  <div className="bg-card rounded-xl border border-border/60 p-4 shadow-card flex items-center justify-between">
    <div>
      <div className="font-semibold">{listing.food_name}</div>
      <div className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
        <span>{listing.quantity} {listing.unit}</span>
        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {listing.pickup_address}</span>
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> expires {new Date(listing.expires_at).toLocaleString()}</span>
      </div>
    </div>
    <Badge variant={listing.status === "available" ? "default" : "secondary"}>{listing.status}</Badge>
  </div>
);

export default Dashboard;
