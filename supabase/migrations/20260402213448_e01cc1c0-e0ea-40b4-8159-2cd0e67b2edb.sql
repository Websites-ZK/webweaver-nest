
CREATE TABLE public.auto_heal_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  hosting_plan_id uuid NOT NULL,
  action_type text NOT NULL DEFAULT 'restart_service',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.auto_heal_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own auto-heal actions"
ON public.auto_heal_actions FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select own auto-heal actions"
ON public.auto_heal_actions FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own auto-heal actions"
ON public.auto_heal_actions FOR UPDATE TO authenticated
USING (auth.uid() = user_id);
