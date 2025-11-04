import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  email: string;
  verificationUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, verificationUrl }: VerificationEmailRequest = await req.json();

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "AI Stock Trader <onboarding@resend.dev>",
        to: [email],
        subject: "Verify your email - AI Stock Trader",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; margin-bottom: 20px;">Verify Your Email</h1>
            <p style="color: #666; margin-bottom: 20px;">
              Thank you for signing up for AI Stock Trader! Please verify your email address by clicking the button below:
            </p>
            <a href="${verificationUrl}" 
               style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              Verify Email
            </a>
            <p style="color: #999; font-size: 14px; margin-top: 20px;">
              If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
        `,
      }),
    });

    const data = await emailResponse.json();
    console.log("Verification email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: emailResponse.ok ? 200 : 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending verification email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
