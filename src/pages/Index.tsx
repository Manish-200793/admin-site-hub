import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, MapPin, Clock, Heart, Brain, Users, Leaf, Quote, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import heroImg from "@/assets/hero-food.jpg";
import communityImg from "@/assets/community.jpg";
import donorImg from "@/assets/donor.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative">
        {/* Decorative blobs */}
        <div aria-hidden className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl animate-blob" />
        <div aria-hidden className="absolute top-20 right-0 h-80 w-80 rounded-full bg-primary/15 blur-3xl animate-blob" style={{ animationDelay: "4s" }} />
        <div aria-hidden className="absolute inset-0 bg-grain opacity-40 pointer-events-none" />

        <div className="container relative grid lg:grid-cols-2 gap-12 items-center pt-20 pb-28">
          <div className="space-y-7 relative z-10 animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft/60 backdrop-blur px-4 py-1.5 text-xs font-medium text-accent">
              <Sparkles className="h-3.5 w-3.5" /> AI-Driven Smart Food Security
            </span>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.02] text-balance">
              No meal wasted.
              <br />
              <span className="text-gradient-warm italic">No one hungry.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl text-balance leading-relaxed">
              ZeroHunger.AI matches surplus food from donors with the people and shelters who need it most — using intelligent prioritization based on urgency, location, and freshness.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button size="lg" asChild className="bg-gradient-warm shadow-warm h-12 px-7 hover:scale-105 transition-smooth">
                <Link to="/auth?mode=signup&role=donor">
                  Donate food <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-7 border-primary/30 hover:bg-primary/5">
                <Link to="/auth?mode=signup&role=receiver">Request food</Link>
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
              <div><strong className="text-foreground text-xl font-display">1.3B</strong> tons wasted yearly</div>
              <div className="h-8 w-px bg-border" />
              <div><strong className="text-foreground text-xl font-display">733M</strong> facing hunger</div>
            </div>
          </div>

          <div className="relative animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="absolute -inset-6 bg-gradient-warm opacity-25 blur-3xl rounded-full" />
            <div className="relative rounded-3xl overflow-hidden shadow-earth ring-1 ring-border/50">
              <img
                src={heroImg}
                alt="Volunteers sharing fresh food across a wooden community table at golden hour"
                width={1600}
                height={1100}
                className="object-cover aspect-[4/3] w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl shadow-soft p-4 border border-border/60 hidden md:flex items-center gap-3 animate-float">
              <div className="h-10 w-10 rounded-full bg-gradient-earth flex items-center justify-center text-primary-foreground">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display font-semibold">12,480 meals</div>
                <div className="text-xs text-muted-foreground">delivered this week</div>
              </div>
            </div>
            <div className="absolute -top-6 -right-6 bg-card rounded-2xl shadow-soft p-4 border border-border/60 hidden md:flex items-center gap-3 animate-float" style={{ animationDelay: "1.5s" }}>
              <div className="h-10 w-10 rounded-full bg-amber/20 flex items-center justify-center text-amber">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display font-semibold">2 min</div>
                <div className="text-xs text-muted-foreground">avg match time</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-border/60 bg-secondary/30">
        <div className="container py-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Verified donors</span>
          <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /> Hyper-local pickups</span>
          <span className="flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> AI prioritization</span>
          <span className="flex items-center gap-2"><Leaf className="h-4 w-4 text-accent" /> Zero waste mission</span>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="container py-28">
        <div className="max-w-2xl mb-14">
          <span className="text-sm font-medium text-accent uppercase tracking-[0.2em]">How it works</span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mt-3 text-balance">
            Three simple steps. <span className="italic text-accent">Powered by AI.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Heart, title: "Donors share surplus", desc: "Restaurants, events, and households post extra food in seconds — quantity, location, and pickup window." },
            { icon: Brain, title: "AI prioritizes & matches", desc: "Our model ranks requests by urgency, proximity, food freshness, and people fed — fairly and instantly." },
            { icon: Users, title: "Receivers collect food", desc: "Shelters, NGOs, and individuals get notified and arrange pickup before food expires. Zero waste." },
          ].map((step, i) => (
            <div key={i} className="group relative bg-card rounded-2xl p-7 border border-border/60 shadow-card hover:shadow-earth hover:-translate-y-1 transition-smooth">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-earth text-primary-foreground mb-5 group-hover:scale-110 group-hover:rotate-3 transition-smooth">
                <step.icon className="h-6 w-6" />
              </div>
              <div className="absolute top-7 right-7 font-display text-5xl text-muted/60 font-semibold">0{i + 1}</div>
              <h3 className="font-display text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              <div className="mt-5 h-1 w-10 rounded-full bg-gradient-warm opacity-0 group-hover:opacity-100 group-hover:w-20 transition-smooth" />
            </div>
          ))}
        </div>
      </section>

      {/* Editorial split */}
      <section className="container pb-28">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="relative order-2 lg:order-1">
            <img
              src={communityImg}
              alt="Hands holding a wooden bowl of fresh vegetables at golden hour"
              width={1024}
              height={1024}
              loading="lazy"
              className="rounded-3xl shadow-earth object-cover aspect-square w-full"
            />
            <div className="absolute -bottom-5 -right-5 bg-card rounded-2xl p-5 border border-border/60 shadow-soft max-w-[220px] hidden md:block">
              <Quote className="h-5 w-5 text-accent mb-2" />
              <p className="text-sm leading-snug">"It feels like the whole neighborhood is feeding each other."</p>
              <p className="text-xs text-muted-foreground mt-2">— Amina, Shelter director</p>
            </div>
          </div>
          <div className="order-1 lg:order-2 space-y-5">
            <span className="text-sm font-medium text-accent uppercase tracking-[0.2em]">Why it matters</span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-balance">
              Surplus, meet purpose.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Every plate rescued is a person fed, an emission avoided, a neighbor reached. Our matching engine works in real time so food moves <em>before</em> it spoils — not after.
            </p>
            <ul className="space-y-3 pt-2">
              {[
                "Real-time freshness & expiry tracking",
                "Distance-aware fair allocation",
                "Verified shelters and NGOs",
                "End-to-end pickup coordination",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-accent" />
                  <span className="text-foreground">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section id="impact" className="bg-gradient-cream py-28 border-y border-border/60 relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-grain opacity-40" />
        <div className="container relative grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-sm font-medium text-accent uppercase tracking-[0.2em]">Impact</span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold mt-3 mb-5 text-balance">
              Every plate matters.<br/>Every minute counts.
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg leading-relaxed">
              Our AI-driven matching ensures food reaches the right people before it spoils — turning waste into nourishment, dignity, and community.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "94%", label: "Match rate within 2h", icon: Clock },
                { value: "12k+", label: "Meals delivered", icon: Heart },
                { value: "320", label: "Active donors", icon: MapPin },
                { value: "8.2t", label: "CO₂e prevented", icon: Leaf },
              ].map((s, i) => (
                <div key={i} className="bg-card rounded-2xl p-5 border border-border/60 shadow-card hover:shadow-earth hover:-translate-y-0.5 transition-smooth">
                  <s.icon className="h-5 w-5 text-accent mb-3" />
                  <div className="font-display text-3xl font-semibold">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative bg-gradient-earth rounded-3xl p-10 text-primary-foreground shadow-earth overflow-hidden">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-amber/30 blur-3xl animate-blob" />
            <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-accent/30 blur-3xl animate-blob" style={{ animationDelay: "3s" }} />
            <div className="relative space-y-5">
              <Sparkles className="h-8 w-8 text-amber" />
              <h3 className="font-display text-3xl md:text-4xl font-semibold leading-tight">
                Join the movement to end food waste.
              </h3>
              <p className="text-primary-foreground/80 leading-relaxed">
                Whether you have food to share or need a meal, ZeroHunger.AI is the bridge between surplus and need.
              </p>
              <div className="flex gap-3 pt-2">
                <Button size="lg" asChild className="bg-amber text-amber-foreground hover:bg-amber/90 hover:scale-105 transition-smooth">
                  <Link to="/auth?mode=signup">Get started — free</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  <Link to="/available-food">Browse food</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container py-28">
        <div className="max-w-2xl mb-14">
          <span className="text-sm font-medium text-accent uppercase tracking-[0.2em]">Voices</span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mt-3 text-balance">
            Real people. <span className="italic">Real meals saved.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Maya R.", role: "Café owner & donor", quote: "I post leftover pastries at closing — within minutes someone's on the way. Nothing goes to waste anymore.", img: donorImg },
            { name: "St. Mark's Shelter", role: "Receiver org.", quote: "We've doubled the meals we serve without doubling our budget. The matching is fast and fair.", img: communityImg },
            { name: "Daniel K.", role: "Volunteer driver", quote: "I love seeing the impact map light up after each run. It feels like the city is healing itself.", img: heroImg },
          ].map((t, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border/60 shadow-card overflow-hidden hover:shadow-earth hover:-translate-y-1 transition-smooth">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={t.img} alt={t.name} loading="lazy" className="h-full w-full object-cover hover:scale-105 transition-smooth" />
              </div>
              <div className="p-6 space-y-3">
                <Quote className="h-5 w-5 text-accent" />
                <p className="text-sm leading-relaxed">"{t.quote}"</p>
                <div className="pt-2 border-t border-border/60">
                  <div className="font-display font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="container pb-28">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-warm p-12 md:p-16 text-center shadow-warm">
          <div aria-hidden className="absolute inset-0 bg-grain opacity-30" />
          <div className="relative max-w-2xl mx-auto space-y-6 text-primary-foreground">
            <Sparkles className="h-8 w-8 mx-auto" />
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-balance">
              A hunger-free world starts with one shared meal.
            </h2>
            <p className="text-primary-foreground/90 text-lg">
              Be the bridge. Donate, receive, or volunteer in your community today.
            </p>
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <Button size="lg" asChild className="bg-background text-foreground hover:bg-background/90 h-12 px-7">
                <Link to="/auth?mode=signup">Create free account <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
