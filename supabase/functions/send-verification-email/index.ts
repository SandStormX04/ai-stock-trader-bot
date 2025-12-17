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

// Input validation function
function validateEmailInput(data: any): {
  valid: boolean;
  error?: string;
  sanitized?: VerificationEmailRequest;
} {
  const { email, verificationUrl } = data;

  // Validate email - required, valid format, max 255 chars
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail.length > 255) {
    return { valid: false, error: 'Email must be less than 255 characters' };
  }
  // Basic email regex validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { valid: false, error: 'Invalid email format' };
  }

  // Validate verificationUrl - required, valid URL format, max 500 chars
  if (!verificationUrl || typeof verificationUrl !== 'string') {
    return { valid: false, error: 'Verification URL is required' };
  }
  const cleanUrl = verificationUrl.trim();
  if (cleanUrl.length > 500) {
    return { valid: false, error: 'Verification URL must be less than 500 characters' };
  }
  // Validate URL format and ensure it's HTTPS
  try {
    const url = new URL(cleanUrl);
    if (url.protocol !== 'https:') {
      return { valid: false, error: 'Verification URL must use HTTPS' };
    }
  } catch {
    return { valid: false, error: 'Invalid verification URL format' };
  }

  return {
    valid: true,
    sanitized: {
      email: cleanEmail,
      verificationUrl: cleanUrl,
    }
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate input
    let requestData;
    try {
      requestData = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const validation = validateEmailInput(requestData);
    if (!validation.valid) {
      console.log('Input validation failed:', validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { email, verificationUrl } = validation.sanitized!;

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
      JSON.stringify({ error: "An unexpected error occurred" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);