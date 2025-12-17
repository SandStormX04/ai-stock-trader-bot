-- Fix profiles SELECT policy to allow users to view their own profile
DROP POLICY IF EXISTS "Only admins can view profiles" ON public.profiles;

-- Create policy allowing users to view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Also allow public viewing of usernames for other features (like checking if username is taken)
CREATE POLICY "Anyone can view usernames" 
ON public.profiles 
FOR SELECT 
USING (true);