-- Messages table for per-request chat
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.food_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  body TEXT NOT NULL CHECK (length(btrim(body)) > 0 AND length(body) <= 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_request_id_created_at ON public.messages(request_id, created_at);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Helper: who is allowed in a request thread?
CREATE OR REPLACE FUNCTION public.can_access_request(_request_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.has_role(_user_id, 'admin'::app_role)
    OR EXISTS (
      SELECT 1
      FROM public.food_requests r
      JOIN public.food_listings l ON l.id = r.listing_id
      WHERE r.id = _request_id
        AND r.status = 'approved'
        AND (r.receiver_id = _user_id OR l.donor_id = _user_id)
    );
$$;

-- SELECT: donor, receiver, or admin (only once approved, except admin always)
CREATE POLICY "Participants and admins read messages"
ON public.messages
FOR SELECT
TO authenticated
USING (public.can_access_request(request_id, auth.uid()));

-- INSERT: must be the sender + must be allowed in the thread
CREATE POLICY "Participants and admins send messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND public.can_access_request(request_id, auth.uid())
);

-- Enable realtime
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
