-- Fix trades.user_id to be NOT NULL (prevents orphaned records)
ALTER TABLE public.trades 
ALTER COLUMN user_id SET NOT NULL;

-- Add DELETE policy for trades table (allows users to delete their own trades)
CREATE POLICY "Users can delete own trades"
ON public.trades
FOR DELETE
USING (auth.uid() = user_id);

-- Add DELETE policy for profiles table (allows users to delete their own profile)
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = id);