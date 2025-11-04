import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EmailVerificationPrompt } from "@/components/EmailVerificationPrompt";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else if (!session.user.email_confirmed_at) {
        setUser(session.user);
        setLoading(false);
      } else {
        navigate("/trade-helper");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else if (!session.user.email_confirmed_at) {
        setUser(session.user);
        setLoading(false);
      } else {
        navigate("/trade-helper");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return null;
  }

  if (user && !user.email_confirmed_at) {
    return <EmailVerificationPrompt email={user.email} onSignOut={handleSignOut} />;
  }

  return null;
};

export default Index;
