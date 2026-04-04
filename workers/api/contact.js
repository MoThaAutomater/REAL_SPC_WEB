/**
 * Contact form submission handler — Cloudflare Worker
 * Stores submissions in D1 database (spc-contacts)
 * Fully wired up in Step 8 of setup.
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { name, email, organization, note } = await request.json();

    if (!name || !email) {
      return new Response(JSON.stringify({ error: 'Name and email are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // D1 insert — uncommented once database is provisioned in Step 8
    // await env.DB.prepare(
    //   'INSERT INTO contacts (name, email, organization, note, created_at) VALUES (?, ?, ?, ?, ?)'
    // ).bind(name, email, organization ?? '', note ?? '', new Date().toISOString()).run();

    console.log('Contact submission received:', { name, email, organization, note });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Contact handler error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
