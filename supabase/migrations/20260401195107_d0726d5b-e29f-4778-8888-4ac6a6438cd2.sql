
-- referral_profiles: one row per user
CREATE TABLE public.referral_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  referral_code text NOT NULL UNIQUE,
  commission_rate integer NOT NULL DEFAULT 10,
  total_referrals integer NOT NULL DEFAULT 0,
  total_referred_revenue numeric NOT NULL DEFAULT 0,
  credits_balance numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.referral_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own referral profile" ON public.referral_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own referral profile" ON public.referral_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own referral profile" ON public.referral_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- referrals: tracks each referred user
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own referrals" ON public.referrals FOR SELECT TO authenticated USING (auth.uid() = referrer_id);
CREATE POLICY "Authenticated can insert referrals" ON public.referrals FOR INSERT TO authenticated WITH CHECK (true);

-- referral_earnings: log of each credit earned
CREATE TABLE public.referral_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_user_id uuid NOT NULL,
  invoice_id uuid,
  amount numeric NOT NULL DEFAULT 0,
  commission_rate integer NOT NULL DEFAULT 10,
  credits_earned numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.referral_earnings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own earnings" ON public.referral_earnings FOR SELECT TO authenticated USING (auth.uid() = referrer_id);

-- Function to process referral earnings
CREATE OR REPLACE FUNCTION public.process_referral_earning(
  p_referred_user_id uuid,
  p_invoice_id uuid,
  p_amount numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer_id uuid;
  v_rate integer;
  v_credits numeric;
  v_total_referrals integer;
  v_total_revenue numeric;
BEGIN
  -- Find the referrer
  SELECT referrer_id INTO v_referrer_id
  FROM public.referrals
  WHERE referred_user_id = p_referred_user_id AND status = 'active'
  LIMIT 1;

  IF v_referrer_id IS NULL THEN
    RETURN;
  END IF;

  -- Get current commission rate
  SELECT commission_rate INTO v_rate
  FROM public.referral_profiles
  WHERE user_id = v_referrer_id;

  IF v_rate IS NULL THEN
    v_rate := 10;
  END IF;

  v_credits := p_amount * v_rate / 100.0;

  -- Insert earning record
  INSERT INTO public.referral_earnings (referrer_id, referred_user_id, invoice_id, amount, commission_rate, credits_earned)
  VALUES (v_referrer_id, p_referred_user_id, p_invoice_id, p_amount, v_rate, v_credits);

  -- Update referral profile
  UPDATE public.referral_profiles
  SET credits_balance = credits_balance + v_credits,
      total_referred_revenue = total_referred_revenue + p_amount
  WHERE user_id = v_referrer_id;

  -- Check thresholds for upgrade to 15%
  SELECT total_referrals, total_referred_revenue + p_amount INTO v_total_referrals, v_total_revenue
  FROM public.referral_profiles
  WHERE user_id = v_referrer_id;

  IF v_rate < 15 AND (v_total_referrals >= 10 OR v_total_revenue >= 1000) THEN
    UPDATE public.referral_profiles
    SET commission_rate = 15
    WHERE user_id = v_referrer_id;
  END IF;
END;
$$;

-- Function to generate a unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_code text;
  v_exists boolean;
BEGIN
  LOOP
    v_code := upper(substr(md5(random()::text), 1, 8));
    SELECT EXISTS(SELECT 1 FROM public.referral_profiles WHERE referral_code = v_code) INTO v_exists;
    IF NOT v_exists THEN
      RETURN v_code;
    END IF;
  END LOOP;
END;
$$;
