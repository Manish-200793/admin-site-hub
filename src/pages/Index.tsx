import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, MapPin, Clock, Heart, Brain, Users, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import heroImg from "@/assets/hero-food.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container grid lg:grid-cols-2 gap-12 items-center pt-16 pb-24">
          <div className="space-y-7 relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
              <Sparkles className="h-3.5 w-3.5" /> AI-Driven Smart Food Security
            </span>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.05] text-balance">
              No meal wasted.
              <br />
              <span className="text-accent italic">No one hungry.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl text-balance">
              ZeroHunger.AI matches surplus food from donors with the people and shelters who need it most — using intelligent prioritization based on urgency, location, and freshness.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button size="lg" asChild className="bg-gradient-warm shadow-warm h-12 px-7">
                <Link to="/auth?mode=signup&role=donor">
                  Donate food <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-7 border-primary/30">
                <Link to="/auth?mode=signup&role=receiver">Request food</Link>
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
              <div><strong className="text-foreground text-xl font-display">1.3B</strong> tons of food wasted annually</div>
              <div className="h-8 w-px bg-border" />
              <div><strong className="text-foreground text-xl font-display">733M</strong> people facing hunger</div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-warm opacity-20 blur-3xl rounded-full" />
            <img
              src={heroImg}
              alt="Volunteers sharing fresh food across a wooden community table at golden hour"
              width={1600}
              height={1100}
              className="relative rounded-3xl shadow-earth object-cover aspect-[4/3] w-full"
            />
            <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl shadow-soft p-4 border border-border/60 hidden md:flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-earth flex items-center justify-center text-primary-foreground">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display font-semibold">12,480 meals</div>
                <div className="text-xs text-muted-foreground">delivered this week</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="container py-24">
        <div className="max-w-2xl mb-14">
          <span className="text-sm font-medium text-accent uppercase tracking-wider">How it works</span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mt-2 text-balance">
            Three simple steps. Powered by AI.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Heart, title: "Donors share surplus", desc: "Restaurants, events, and households post extra food in seconds — quantity, location, and pickup window." },
            { icon: Brain, title: "AI prioritizes & matches", desc: "Our model ranks requests by urgency, proximity, food freshness, and people fed — fairly and instantly." },
            { icon: Users, title: "Receivers collect food", desc: "Shelters, NGOs, and individuals get notified and arrange pickup before food expires. Zero waste." },
          ].map((step, i) => (
            <div key={i} className="group relative bg-card rounded-2xl p-7 border border-border/60 shadow-card hover:shadow-earth transition-smooth">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-earth text-primary-foreground mb-5 group-hover:scale-110 transition-smooth">
                <step.icon className="h-6 w-6" />
              </div>
              <div className="absolute top-7 right-7 font-display text-5xl text-muted/60 font-semibold">0{i + 1}</div>
              <h3 className="font-display text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Impact */}
      <section id="impact" className="bg-gradient-cream py-24 border-y border-border/60">
        <div className="container grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-sm font-medium text-accent uppercase tracking-wider">Impact</span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold mt-2 mb-5 text-balance">
              Every plate matters. Every minute counts.
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg">
              Our AI-driven matching ensures food reaches the right people before it spoils — turning waste into nourishment, dignity, and community.
            </p>
            <div className="grid grid-cols-2 gap-6">
              {[
                { value: "94%", label: "Match rate within 2h", icon: Clock },
                { value: "12k+", label: "Meals delivered", icon: Heart },
                { value: "320", label: "Active donors", icon: MapPin },
                { value: "8.2t", label: "CO₂e prevented", icon: Leaf },
              ].map((s, i) => (
                <div key={i} className="bg-card rounded-xl p-5 border border-border/60 shadow-card">
                  <s.icon className="h-5 w-5 text-accent mb-3" />
                  <div className="font-display text-3xl font-semibold">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative bg-gradient-earth rounded-3xl p-10 text-primary-foreground shadow-earth overflow-hidden">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-amber/30 blur-3xl" />
            <div className="relative space-y-5">
              <Sparkles className="h-8 w-8 text-amber" />
              <h3 className="font-display text-3xl font-semibold leading-tight">
                Join the movement to end food waste.
              </h3>
              <p className="text-primary-foreground/80">
                Whether you have food to share or need a meal, ZeroHunger.AI is the bridge between surplus and need.
              </p>
              <div className="flex gap-3 pt-2">
                <Button size="lg" asChild className="bg-amber text-amber-foreground hover:bg-amber/90">
                  <Link to="/auth?mode=signup">Get started — free</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
