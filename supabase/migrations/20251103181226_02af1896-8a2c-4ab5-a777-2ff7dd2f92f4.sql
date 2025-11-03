-- Remove Tradeovate columns from profiles table
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS tradeovate_username,
DROP COLUMN IF EXISTS tradeovate_password;