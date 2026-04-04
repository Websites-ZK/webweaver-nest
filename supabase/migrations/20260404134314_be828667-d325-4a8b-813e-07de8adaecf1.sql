
-- Create servers table
CREATE TABLE public.servers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  location TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.servers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view servers" ON public.servers
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert servers" ON public.servers
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update servers" ON public.servers
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create server_daily_metrics table
CREATE TABLE public.server_daily_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  metric TEXT NOT NULL,
  value NUMERIC,
  status TEXT NOT NULL DEFAULT 'ok',
  notes TEXT,
  recorded_by TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date DATE NOT NULL DEFAULT CURRENT_DATE
);

ALTER TABLE public.server_daily_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view metrics" ON public.server_daily_metrics
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert metrics" ON public.server_daily_metrics
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update metrics" ON public.server_daily_metrics
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
