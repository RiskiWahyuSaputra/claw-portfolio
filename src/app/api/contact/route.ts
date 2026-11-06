const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Payload = { name?: unknown; email?: unknown; message?: unknown; website?: unknown };

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real visitors never see this field, so report success and drop it.
  if (body.website) return Response.json({ ok: true });

  const name = text(body.name, 120);
  const email = text(body.email, 200);
  const message = text(body.message, 5000);
  if (!name || !EMAIL.test(email) || message.length < 10) {
    return Response.json({ error: "Please check your name, email, and message." }, { status: 422 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // No mail provider configured: the client falls back to the visitor's mail app.
    return Response.json({ fallback: true });
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>",
      to: process.env.CONTACT_TO_EMAIL ?? "kiik37734@gmail.com",
      reply_to: email,
      subject: `Portfolio message from ${name}`,
      text: `${message}\n\nFrom: ${name} <${email}>`,
    }),
  });

  if (!response.ok) return Response.json({ fallback: true });
  return Response.json({ ok: true });
}
