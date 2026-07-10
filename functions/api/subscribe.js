// Cloudflare Pages Function — POST /api/subscribe
// Captures lead-magnet email signups.
//
// Storage is optional and graceful:
//   - If a KV namespace is bound as SUBSCRIBERS, the email is stored there.
//   - If an EMAILIT_API_KEY + EMAILIT_LIST_ID are set, it also forwards to Emailit.
//   - With neither configured, it still returns success so the funnel works on day one.

export async function onRequestPost({ request, env }) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  let email = ''
  try {
    const body = await request.json()
    email = String(body.email || '').trim().toLowerCase()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request.' }), { status: 400, headers: cors })
  }

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  if (!valid) {
    return new Response(JSON.stringify({ error: 'Please enter a valid email.' }), { status: 400, headers: cors })
  }

  // Store in KV if available.
  try {
    if (env.SUBSCRIBERS) {
      await env.SUBSCRIBERS.put(
        `sub:${email}`,
        JSON.stringify({ email, ts: new Date().toISOString() })
      )
    }
  } catch (e) {
    // Don't fail the signup if storage hiccups.
    console.error('KV put failed', e)
  }

  // Optionally forward to Emailit.
  try {
    if (env.EMAILIT_API_KEY && env.EMAILIT_LIST_ID) {
      await fetch('https://api.emailit.com/v1/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.EMAILIT_API_KEY}`,
        },
        body: JSON.stringify({ email, list_id: env.EMAILIT_LIST_ID }),
      })
    }
  } catch (e) {
    console.error('Emailit forward failed', e)
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: cors })
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
