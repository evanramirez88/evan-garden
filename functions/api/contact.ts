/**
 * Contact Form Handler - Cloudflare Pages Function
 *
 * This function handles contact form submissions with:
 * - Honeypot spam protection
 * - Rate limiting (via KV, if configured)
 * - Email sending (via Resend, if configured)
 *
 * Environment variables needed:
 * - RESEND_API_KEY: API key for Resend email service (optional)
 * - CONTACT_EMAIL: Email address to receive messages (optional)
 * - CONTACT_KV: KV namespace binding for rate limiting (optional)
 */

interface Env {
  RESEND_API_KEY?: string;
  CONTACT_EMAIL?: string;
  CONTACT_KV?: KVNamespace;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const formData = await request.formData();

    // Check honeypot field - if filled, it's likely a bot
    const honeypot = formData.get('website');
    if (honeypot) {
      // Silently accept but don't process (don't reveal the trap)
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Extract form fields
    const name = formData.get('name')?.toString().trim();
    const email = formData.get('email')?.toString().trim();
    const subject = formData.get('subject')?.toString().trim();
    const message = formData.get('message')?.toString().trim();

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email address' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting (if KV is configured)
    if (env.CONTACT_KV) {
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const rateLimitKey = `ratelimit:${ip}`;
      const submissions = await env.CONTACT_KV.get(rateLimitKey);

      if (submissions && parseInt(submissions) >= 5) {
        return new Response(
          JSON.stringify({ success: false, error: 'Too many submissions. Please try again later.' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Increment rate limit counter
      await env.CONTACT_KV.put(
        rateLimitKey,
        String((parseInt(submissions || '0') || 0) + 1),
        { expirationTtl: 3600 } // 1 hour
      );
    }

    // Send email (if Resend is configured)
    if (env.RESEND_API_KEY && env.CONTACT_EMAIL) {
      const subjectLabels: Record<string, string> = {
        consulting: 'Consulting Inquiry',
        collaboration: 'Collaboration Idea',
        conversation: 'General Chat',
        other: 'Other',
      };

      const emailSubject = `[evan.garden] ${subjectLabels[subject || 'other'] || subject}: ${name}`;

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'evan.garden <noreply@evan.garden>',
          to: env.CONTACT_EMAIL,
          reply_to: email,
          subject: emailSubject,
          text: `
Name: ${name}
Email: ${email}
Subject: ${subjectLabels[subject || 'other'] || subject}

Message:
${message}

---
Sent from evan.garden contact form
          `.trim(),
        }),
      });

      if (!response.ok) {
        console.error('Failed to send email:', await response.text());
        // Don't expose email failure to user - still accept the submission
      }
    } else {
      // Log submission if email is not configured
      console.log('Contact form submission (email not configured):', {
        name,
        email,
        subject,
        message: message.substring(0, 100) + '...',
        timestamp: new Date().toISOString(),
      });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'An unexpected error occurred' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
