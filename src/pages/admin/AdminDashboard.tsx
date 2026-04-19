import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Users, Package, Inbox, LogOut, Loader2, Sprout, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const AdminDashboard = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, listings: 0, requests: 0, available: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.classList.add("admin-theme");
    return () => document.documentElement.classList.remove("admin-theme");
  }, []);

  const load = async () => {
    setLoading(true);
    const [profilesRes, listingsRes, requestsRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("food_listings").select("*").order("created_at", { ascending: false }),
      supabase.from("food_requests").select("*, food_listings(food_name)").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);

    const rolesByUser = new Map<string, string[]>();
    (rolesRes.data ?? []).forEach((r) => {
      const list = rolesByUser.get(r.user_id) ?? [];
      list.push(r.role);
      rolesByUser.set(r.user_id, list);
    });

    const enriched = (profilesRes.data ?? []).map((p) => ({
      ...p,
      roles: rolesByUser.get(p.user_id) ?? [],
    }));

    setUsers(enriched);
    setListings(listingsRes.data ?? []);
    setRequests(requestsRes.data ?? []);
    setStats({
      users: enriched.length,
      listings: (listingsRes.data ?? []).length,
      requests: (requestsRes.data ?? []).length,
      available: (listingsRes.data ?? []).filter((l) => l.status === "available").length,
    });
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const deleteListing = async (id: string) => {
    const { error } = await supabase.from("food_listings").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Listing removed"); load(); }
  };

  const promoteToAdmin = async (userId: string) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
    if (error) toast.error(error.message);
    else { toast.success("Promoted to admin"); load(); }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card/50 backdrop-blur sticky top-0 z-30">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-warm shadow-warm">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </span>
            <div>
              <div className="font-display text-lg font-semibold leading-tight">Admin Portal</div>
              <div className="text-[11px] text-muted-foreground">ZeroHunger.AI</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/"><Sprout className="h-4 w-4 mr-2" /> Public site</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={async () => { await signOut(); navigate("/admin/login"); }}>
              <LogOut className="h-4 w-4 mr-2" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-10">
        <h1 className="font-display text-4xl font-semibold mb-1">Overview</h1>
        <p className="text-muted-foreground mb-8">Signed in as <span className="text-foreground">{user?.email}</span></p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard icon={Users} label="Users" value={stats.users} />
          <StatCard icon={Package} label="Total listings" value={stats.listings} />
          <StatCard icon={Sprout} label="Available now" value={stats.available} accent />
          <StatCard icon={Inbox} label="Food requests" value={stats.requests} />
        </div>

        <Tabs defaultValue="listings">
          <TabsList>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="mt-5">
            {loading ? <Spinner /> : (
              <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="text-left p-4">Food</th>
                      <th className="text-left p-4">Qty</th>
                      <th className="text-left p-4">Pickup</th>
                      <th className="text-left p-4">Expires</th>
                      <th className="text-left p-4">Status</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((l) => (
                      <tr key={l.id} className="border-t border-border/60">
                        <td className="p-4 font-medium">{l.food_name}</td>
                        <td className="p-4">{l.quantity} {l.unit}</td>
                        <td className="p-4 text-muted-foreground max-w-xs truncate">{l.pickup_address}</td>
                        <td className="p-4 text-muted-foreground">{new Date(l.expires_at).toLocaleString()}</td>
                        <td className="p-4"><Badge variant="secondary">{l.status}</Badge></td>
                        <td className="p-4">
                          <Button size="sm" variant="ghost" onClick={() => deleteListing(l.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {listings.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No listings yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="mt-5">
            {loading ? <Spinner /> : (
              <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="text-left p-4">Food</th>
                      <th className="text-left p-4">People</th>
                      <th className="text-left p-4">Urgency</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r.id} className="border-t border-border/60">
                        <td className="p-4 font-medium">{r.food_listings?.food_name ?? "—"}</td>
                        <td className="p-4">{r.people_count}</td>
                        <td className="p-4"><Badge variant="outline">{r.urgency}</Badge></td>
                        <td className="p-4"><Badge variant="secondary">{r.status}</Badge></td>
                        <td className="p-4 text-muted-foreground">{new Date(r.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                    {requests.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No requests yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="mt-5">
            {loading ? <Spinner /> : (
              <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="text-left p-4">Name</th>
                      <th className="text-left p-4">Phone</th>
                      <th className="text-left p-4">Roles</th>
                      <th className="text-left p-4">Joined</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-t border-border/60">
                        <td className="p-4 font-medium">{u.full_name || "—"}</td>
                        <td className="p-4 text-muted-foreground">{u.phone || "—"}</td>
                        <td className="p-4">
                          <div className="flex gap-1 flex-wrap">
                            {u.roles.map((r: string) => (
                              <Badge key={r} variant={r === "admin" ? "default" : "secondary"}>{r}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="p-4">
                          {!u.roles.includes("admin") && (
                            <Button size="sm" variant="outline" onClick={() => promoteToAdmin(u.user_id)}>
                              Make admin
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, accent }: any) => (
  <div className={`bg-card rounded-2xl border border-border/60 p-5 ${accent ? "shadow-warm" : "shadow-card"}`}>
    <Icon className={`h-5 w-5 ${accent ? "text-accent" : "text-primary"} mb-3`} />
    <div className="font-display text-3xl font-semibold">{value}</div>
    <div className="text-xs text-muted-foreground mt-1">{label}</div>
  </div>
);

const Spinner = () => (
  <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
);

export default AdminDashboard;
