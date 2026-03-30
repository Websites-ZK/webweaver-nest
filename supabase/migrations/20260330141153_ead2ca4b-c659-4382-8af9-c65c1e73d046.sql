
-- Hosting plans table
CREATE TABLE public.hosting_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name text NOT NULL DEFAULT 'Starter',
  billing_period text NOT NULL DEFAULT 'monthly',
  status text NOT NULL DEFAULT 'active',
  domain text,
  server_location text NOT NULL DEFAULT 'EU-Frankfurt',
  storage_limit_gb numeric NOT NULL DEFAULT 10,
  storage_used_gb numeric NOT NULL DEFAULT 0,
  bandwidth_limit_gb numeric NOT NULL DEFAULT 100,
  bandwidth_used_gb numeric NOT NULL DEFAULT 0,
  cpu_cores integer NOT NULL DEFAULT 1,
  ram_mb integer NOT NULL DEFAULT 1024,
  ram_used_mb integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '1 year')
);

ALTER TABLE public.hosting_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own hosting plans" ON public.hosting_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own hosting plans" ON public.hosting_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own hosting plans" ON public.hosting_plans FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Domains table
CREATE TABLE public.domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain_name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  dns_provider text DEFAULT 'WebWeaver DNS',
  ssl_enabled boolean NOT NULL DEFAULT true,
  registered_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '1 year')
);

ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own domains" ON public.domains FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own domains" ON public.domains FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own domains" ON public.domains FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Invoices table
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  status text NOT NULL DEFAULT 'paid',
  description text NOT NULL DEFAULT 'Hosting Plan',
  created_at timestamptz NOT NULL DEFAULT now(),
  due_date timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoices" ON public.invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own invoices" ON public.invoices FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Seed demo data trigger on profile creation
CREATE OR REPLACE FUNCTION public.seed_demo_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.hosting_plans (user_id, plan_name, billing_period, status, domain, server_location, storage_limit_gb, storage_used_gb, bandwidth_limit_gb, bandwidth_used_gb, cpu_cores, ram_mb, ram_used_mb)
  VALUES (NEW.user_id, 'Business Pro', 'yearly', 'active', 'mywebsite.com', 'EU-Frankfurt', 50, 12.4, 500, 187, 4, 4096, 1820);

  INSERT INTO public.hosting_plans (user_id, plan_name, billing_period, status, domain, server_location, storage_limit_gb, storage_used_gb, bandwidth_limit_gb, bandwidth_used_gb, cpu_cores, ram_mb, ram_used_mb)
  VALUES (NEW.user_id, 'Starter', 'monthly', 'active', 'blog.example.com', 'EU-Amsterdam', 10, 2.1, 100, 34, 1, 1024, 420);

  INSERT INTO public.domains (user_id, domain_name, status, ssl_enabled)
  VALUES (NEW.user_id, 'mywebsite.com', 'active', true);

  INSERT INTO public.domains (user_id, domain_name, status, ssl_enabled)
  VALUES (NEW.user_id, 'blog.example.com', 'active', true);

  INSERT INTO public.domains (user_id, domain_name, status, ssl_enabled, registered_at, expires_at)
  VALUES (NEW.user_id, 'shop.mywebsite.com', 'pending', false, now(), now() + interval '1 year');

  INSERT INTO public.invoices (user_id, amount, currency, status, description, created_at, due_date)
  VALUES 
    (NEW.user_id, 149.88, 'EUR', 'paid', 'Business Pro - Annual', now() - interval '30 days', now() - interval '30 days'),
    (NEW.user_id, 4.99, 'EUR', 'paid', 'Starter - Monthly', now() - interval '15 days', now() - interval '15 days'),
    (NEW.user_id, 4.99, 'EUR', 'pending', 'Starter - Monthly', now(), now() + interval '15 days');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_seed_demo
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.seed_demo_data();
