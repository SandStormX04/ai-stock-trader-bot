-- Add Tradeovate credentials to profiles table
ALTER TABLE public.profiles
ADD COLUMN tradeovate_username text,
ADD COLUMN tradeovate_password text;

-- Note: In production, passwords should be encrypted
-- For now storing as text but should implement encryption