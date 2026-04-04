
CREATE TABLE public.server_monthly_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id uuid NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  month date NOT NULL DEFAULT (date_trunc('month', CURRENT_DATE))::date,
  metric text NOT NULL,
  value numeric,
  status text NOT NULL DEFAULT 'ok',
  notes text,
  recorded_by text,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (server_id, month, metric)
);

ALTER TABLE public.server_monthly_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view monthly metrics" ON public.server_monthly_metrics
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert monthly metrics" ON public.server_monthly_metrics
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update monthly metrics" ON public.server_monthly_metrics
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
