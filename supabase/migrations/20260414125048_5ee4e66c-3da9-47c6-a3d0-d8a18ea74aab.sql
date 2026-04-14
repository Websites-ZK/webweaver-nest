-- Remove all seeded placeholder domains
DELETE FROM domains WHERE domain_name IN ('mywebsite.com', 'blog.example.com', 'shop.mywebsite.com');

-- Also remove seeded placeholder hosting plans and invoices
DELETE FROM hosting_plans WHERE domain IN ('mywebsite.com', 'blog.example.com');
DELETE FROM invoices WHERE description IN ('Business Pro - Annual', 'Starter - Monthly');

-- Update seed_demo_data to stop creating fake data
CREATE OR REPLACE FUNCTION public.seed_demo_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- No longer seed placeholder data
  RETURN NEW;
END;
$function$;