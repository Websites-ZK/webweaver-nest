
-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all invoices
CREATE POLICY "Admins can view all invoices"
ON public.invoices FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all hosting plans
CREATE POLICY "Admins can view all hosting plans"
ON public.hosting_plans FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all domains
CREATE POLICY "Admins can view all domains"
ON public.domains FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow inserts to health checks (service role from edge function)
CREATE POLICY "Service can insert health checks"
ON public.server_health_checks FOR INSERT
WITH CHECK (true);

-- Allow inserts to admin alerts (service role from edge function)
CREATE POLICY "Service can insert alerts"
ON public.admin_alerts FOR INSERT
WITH CHECK (true);
