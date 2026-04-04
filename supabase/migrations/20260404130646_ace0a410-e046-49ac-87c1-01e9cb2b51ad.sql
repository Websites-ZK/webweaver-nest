
CREATE TABLE public.alert_thresholds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric text NOT NULL,
  threshold_percent integer NOT NULL DEFAULT 90,
  severity text NOT NULL DEFAULT 'warning',
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.alert_thresholds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view thresholds" ON public.alert_thresholds
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert thresholds" ON public.alert_thresholds
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update thresholds" ON public.alert_thresholds
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.alert_thresholds (metric, threshold_percent, severity, is_enabled) VALUES
  ('cpu', 90, 'critical', true),
  ('ram', 85, 'warning', true),
  ('ram', 95, 'critical', true),
  ('disk', 90, 'critical', true),
  ('bandwidth', 85, 'warning', true);
