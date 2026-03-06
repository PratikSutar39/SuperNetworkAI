import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is required");
    }
    _resend = new Resend(apiKey);
  }
  return _resend;
}

export async function sendVerificationEmail({
  email,
  name,
  token,
}: {
  email: string;
  name: string;
  token: string;
}) {
  const resend = getResend();
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/api/auth/verify?token=${token}`;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@supernetworkai.com";

  const { error } = await resend.emails.send({
    from: `SuperNetworkAI <${fromEmail}>`,
    to: email,
    subject: "Verify your email - SuperNetworkAI",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #FFF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 560px; margin: 0 auto; padding: 40px 24px;">
            <!-- Logo -->
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="display: inline-block; width: 48px; height: 48px; border-radius: 16px; background: linear-gradient(135deg, #E8734A, #D4613A); line-height: 48px; text-align: center;">
                <span style="color: white; font-weight: bold; font-size: 18px;">SN</span>
              </div>
            </div>

            <!-- Card -->
            <div style="background: white; border-radius: 20px; padding: 40px 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); border: 1px solid rgba(0,0,0,0.06);">
              <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #1a1a2e; text-align: center;">
                Verify your email
              </h1>
              <p style="margin: 0 0 28px; font-size: 14px; color: #6b7280; text-align: center; line-height: 1.5;">
                Hi ${name}, welcome to SuperNetworkAI! Click the button below to verify your email and start building your profile.
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 28px;">
                <a href="${verifyUrl}" style="display: inline-block; padding: 14px 36px; border-radius: 14px; background: linear-gradient(135deg, #E8734A, #D4613A); color: white; text-decoration: none; font-weight: 600; font-size: 15px;">
                  Verify Email &amp; Get Started
                </a>
              </div>

              <p style="margin: 0 0 16px; font-size: 13px; color: #9ca3af; text-align: center; line-height: 1.5;">
                This link expires in 24 hours. If you didn't create an account on SuperNetworkAI, you can safely ignore this email.
              </p>

              <!-- Fallback URL -->
              <div style="background: #f9fafb; border-radius: 12px; padding: 16px; margin-top: 20px;">
                <p style="margin: 0 0 6px; font-size: 12px; color: #6b7280;">
                  If the button doesn't work, copy and paste this link:
                </p>
                <p style="margin: 0; font-size: 12px; color: #E8734A; word-break: break-all;">
                  ${verifyUrl}
                </p>
              </div>
            </div>

            <!-- Footer -->
            <p style="margin: 24px 0 0; font-size: 12px; color: #9ca3af; text-align: center;">
              SuperNetworkAI - Find your perfect cofounder, teammate, or client.
            </p>
          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error("Failed to send verification email:", error);
    throw new Error("Failed to send verification email");
  }
}
