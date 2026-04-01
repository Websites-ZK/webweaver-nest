
-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. has_role security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 4. RLS policies for user_roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. server_health_checks table
CREATE TABLE public.server_health_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_url text NOT NULL,
  status_code integer,
  response_time_ms integer,
  is_up boolean NOT NULL DEFAULT true,
  checked_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.server_health_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view health checks"
ON public.server_health_checks FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 6. admin_alerts table
CREATE TABLE public.admin_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL DEFAULT 'downtime',
  severity text NOT NULL DEFAULT 'warning',
  message text NOT NULL,
  is_resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
ALTER TABLE public.admin_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view alerts"
ON public.admin_alerts FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update alerts"
ON public.admin_alerts FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 7. onboarding_events table
CREATE TABLE public.onboarding_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  step integer NOT NULL,
  action text NOT NULL DEFAULT 'entered',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.onboarding_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own onboarding events"
ON public.onboarding_events FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all onboarding events"
ON public.onboarding_events FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 8. get_admin_stats function
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_users', (SELECT count(*) FROM public.profiles),
    'active_plans', (SELECT count(*) FROM public.hosting_plans WHERE status = 'active'),
    'total_domains', (SELECT count(*) FROM public.domains),
    'total_revenue', (SELECT COALESCE(sum(amount), 0) FROM public.invoices WHERE status = 'paid'),
    'pending_revenue', (SELECT COALESCE(sum(amount), 0) FROM public.invoices WHERE status = 'pending'),
    'mrr', (SELECT COALESCE(sum(amount), 0) FROM public.invoices WHERE status = 'paid' AND created_at >= now() - interval '30 days'),
    'total_referral_credits', (SELECT COALESCE(sum(credits_balance), 0) FROM public.referral_profiles),
    'total_referral_earnings', (SELECT COALESCE(sum(credits_earned), 0) FROM public.referral_earnings),
    'onboarding_completions', (SELECT count(DISTINCT user_id) FROM public.onboarding_events WHERE step = 4 AND action = 'completed'),
    'recent_signups_7d', (SELECT count(*) FROM public.profiles WHERE created_at >= now() - interval '7 days'),
    'plan_distribution', (SELECT COALESCE(jsonb_agg(jsonb_build_object('plan', plan_name, 'count', cnt)), '[]'::jsonb) FROM (SELECT plan_name, count(*) as cnt FROM public.hosting_plans WHERE status = 'active' GROUP BY plan_name) sub),
    'location_distribution', (SELECT COALESCE(jsonb_agg(jsonb_build_object('location', server_location, 'count', cnt)), '[]'::jsonb) FROM (SELECT server_location, count(*) as cnt FROM public.hosting_plans WHERE status = 'active' GROUP BY server_location) sub)
  ) INTO v_result;
  RETURN v_result;
END;
$$;

-- 9. get_onboarding_funnel function
CREATE OR REPLACE FUNCTION public.get_onboarding_funnel()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'step', step,
    'entered', entered,
    'completed', completed,
    'abandoned', abandoned
  ) ORDER BY step), '[]'::jsonb)
  INTO v_result
  FROM (
    SELECT
      step,
      count(*) FILTER (WHERE action = 'entered') as entered,
      count(*) FILTER (WHERE action = 'completed') as completed,
      count(*) FILTER (WHERE action = 'abandoned') as abandoned
    FROM public.onboarding_events
    GROUP BY step
  ) sub;
  RETURN v_result;
END;
$$;
