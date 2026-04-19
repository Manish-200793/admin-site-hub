-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'donor', 'receiver');
CREATE TYPE public.listing_status AS ENUM ('available', 'reserved', 'completed', 'expired');
CREATE TYPE public.request_status AS ENUM ('pending', 'approved', 'rejected', 'fulfilled');
CREATE TYPE public.urgency_level AS ENUM ('low', 'medium', 'high');

-- updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- User roles (separate table — never on profiles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer role check (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Food listings
CREATE TABLE public.food_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  description TEXT,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL DEFAULT 'servings',
  pickup_address TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  status listing_status NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.food_listings ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER food_listings_updated_at BEFORE UPDATE ON public.food_listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_listings_status ON public.food_listings(status);
CREATE INDEX idx_listings_donor ON public.food_listings(donor_id);

-- Food requests
CREATE TABLE public.food_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.food_listings(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  people_count INTEGER NOT NULL DEFAULT 1 CHECK (people_count > 0),
  urgency urgency_level NOT NULL DEFAULT 'medium',
  message TEXT,
  status request_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.food_requests ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER food_requests_updated_at BEFORE UPDATE ON public.food_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_requests_listing ON public.food_requests(listing_id);
CREATE INDEX idx_requests_receiver ON public.food_requests(receiver_id);

-- ============ RLS POLICIES ============

-- profiles
CREATE POLICY "Profiles viewable by authenticated"
  ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage all profiles"
  ON public.profiles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- user_roles (only admins manage; users can read their own)
CREATE POLICY "Users read own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins read all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- food_listings
CREATE POLICY "Authenticated view listings"
  ON public.food_listings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Donors create own listings"
  ON public.food_listings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = donor_id AND public.has_role(auth.uid(), 'donor'));
CREATE POLICY "Donors update own listings"
  ON public.food_listings FOR UPDATE TO authenticated
  USING (auth.uid() = donor_id);
CREATE POLICY "Donors delete own listings"
  ON public.food_listings FOR DELETE TO authenticated
  USING (auth.uid() = donor_id);
CREATE POLICY "Admins manage listings"
  ON public.food_listings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- food_requests
CREATE POLICY "Receivers see own requests"
  ON public.food_requests FOR SELECT TO authenticated
  USING (auth.uid() = receiver_id);
CREATE POLICY "Donors see requests on their listings"
  ON public.food_requests FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.food_listings l WHERE l.id = listing_id AND l.donor_id = auth.uid()));
CREATE POLICY "Receivers create requests"
  ON public.food_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = receiver_id AND public.has_role(auth.uid(), 'receiver'));
CREATE POLICY "Receivers update own requests"
  ON public.food_requests FOR UPDATE TO authenticated
  USING (auth.uid() = receiver_id);
CREATE POLICY "Donors update requests on their listings"
  ON public.food_requests FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.food_listings l WHERE l.id = listing_id AND l.donor_id = auth.uid()));
CREATE POLICY "Admins manage requests"
  ON public.food_requests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile + default receiver role on signup.
-- Donor role is granted client-side after signup if user chose donor.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  chosen_role app_role;
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );

  -- Read desired role from signup metadata; default receiver. Never admin via signup.
  chosen_role := CASE
    WHEN NEW.raw_user_meta_data->>'role' = 'donor' THEN 'donor'::app_role
    ELSE 'receiver'::app_role
  END;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, chosen_role);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();