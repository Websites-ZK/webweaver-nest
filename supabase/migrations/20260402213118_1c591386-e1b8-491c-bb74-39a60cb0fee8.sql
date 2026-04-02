CREATE POLICY "Users can view health checks for their domains"
ON public.server_health_checks
FOR SELECT
TO authenticated
USING (
  target_url IN (
    SELECT domain_name FROM public.domains WHERE user_id = auth.uid()
  )
);