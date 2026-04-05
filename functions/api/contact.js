/**
 * Cloudflare Pages Function — POST /api/contact
 *
 * Handles contact form submissions and writes to D1.
 *
 * D1 binding      : DB  (set in wrangler.toml + Pages dashboard)
 * Database        : contact-submissions
 * Table           : submissions
 *
 * Schema:
 *   id           INTEGER   PRIMARY KEY
 *   name         TEXT
 *   email        TEXT
 *   message      TEXT      ← mapped from form field "note"
 *   organization TEXT      ← its own column, never parsed out of free text
 *   created_at   DATETIME  DEFAULT CURRENT_TIMESTAMP
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'https://smart-pick.co',
  };

  // ── Parse body ─────────────────────────────────────────────────────────────
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid request.' }),
      { status: 400, headers }
    );
  }

  // ── Extract and sanitize fields ────────────────────────────────────────────
  const name         = (body.name         || '').trim();
  const email        = (body.email        || '').trim().toLowerCase();
  const organization = (body.organization || '').trim();
  const message      = (body.note         || '').trim(); // form sends "note", stored as "message"

  // ── Validate required fields ───────────────────────────────────────────────
  if (!name) {
    return new Response(
      JSON.stringify({ error: 'Name is required.' }),
      { status: 400, headers }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return new Response(
      JSON.stringify({ error: 'A valid email address is required.' }),
      { status: 400, headers }
    );
  }

  // ── Write to D1 ────────────────────────────────────────────────────────────
  try {
    await env.DB
      .prepare(`
        INSERT INTO submissions (name, email, organization, message)
        VALUES (?, ?, ?, ?)
      `)
      .bind(name, email, organization, message)
      .run();

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers }
    );

  } catch (err) {
    console.error('[contact] D1 insert failed:', err);
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please try again.' }),
      { status: 500, headers }
    );
  }
}

// ── Preflight CORS ─────────────────────────────────────────────────────────
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin':  'https://smart-pick.co',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
