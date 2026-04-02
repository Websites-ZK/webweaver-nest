
CREATE TABLE public.user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  domain_name text NOT NULL,
  notification_type text NOT NULL DEFAULT 'downtime',
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
ON public.user_notifications FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.user_notifications FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service can insert notifications"
ON public.user_notifications FOR INSERT TO public
WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.user_notifications;
