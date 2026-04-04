

## Problem
Korisnik `sales@lipa-app.com` nema admin ulogu u bazi. Trigger `auto_assign_admin_role` dodjeljuje admin samo za `admin@gmail.com`.

## Rješenje
Ažurirati trigger da uključi i `sales@lipa-app.com` kao admin email, plus ručno dodati admin rolu za postojećeg korisnika.

### Database Migration
Jedna migracija s dva dijela:

1. **Ručno dodati admin rolu** za postojećeg `sales@lipa-app.com` korisnika:
```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'sales@lipa-app.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

2. **Ažurirati trigger** da prepoznaje oba admin emaila:
```sql
CREATE OR REPLACE FUNCTION public.auto_assign_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.email IN ('admin@gmail.com', 'sales@lipa-app.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
```

### No frontend changes needed
The Server Daily Dashboard tab and component already exist and will become visible once the user has the admin role.

### Files to modify
- **New migration** -- single SQL file with both the insert and trigger update

