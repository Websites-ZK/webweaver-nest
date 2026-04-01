
CREATE OR REPLACE FUNCTION public.process_referral_signup(p_referrer_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.referral_profiles
  SET total_referrals = total_referrals + 1
  WHERE user_id = p_referrer_id;
END;
$$;
