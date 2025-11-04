import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, RefreshCw } from "lucide-react";

interface EmailVerificationPromptProps {
  email: string;
  onSignOut: () => void;
}

export const EmailVerificationPrompt = ({ email, onSignOut }: EmailVerificationPromptProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleResendVerification = async () => {
    setLoading(true);
    try {
      await supabase.functions.invoke('send-verification-email', {
        body: {
          email,
          verificationUrl: `${window.location.origin}/`,
        },
      });

      toast({
        title: "Verification email sent!",
        description: "Please check your inbox and click the verification link.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to send email",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 border-primary/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Verify Your Email</h1>
          <p className="text-muted-foreground">
            We've sent a verification link to <span className="font-semibold text-foreground">{email}</span>
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-secondary/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              You need to verify your email address before you can access AI Stock Trader. 
              Please check your inbox and click the verification link.
            </p>
          </div>

          <Button
            onClick={handleResendVerification}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? "Sending..." : "Resend Verification Email"}
          </Button>

          <Button
            onClick={onSignOut}
            variant="ghost"
            className="w-full"
          >
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
};
