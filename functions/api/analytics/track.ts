// POST /api/analytics/track — receive batched events
// Stores events in KV with type-prefixed keys for fast listing

interface Env {
  DEPLOY_KV: KVNamespace;
}

interface TrackEvent {
  event: string;
  page: string;
  tool_id?: string;
  device?: string;
  scene_type?: string;
  platform?: string;
  location?: string;
  recommendation_count?: number;
  referrer: string;
  timestamp: number;
  session_id: string;
}

const PREFIX_MAP: Record<string, string> = {
  page_view: 'pv',
  wizard_open: 'wiz',
  device_select: 'dev',
  tool_click: 'tool',
  deploy_start: 'deps',
  deploy_complete: 'done',
  hero_cta_click: 'hero',
  scene_card_click: 'scene',
  results_viewed: 'res',
};

export async function onRequest(context: { request: Request; env: Env }) {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body: { events: TrackEvent[] } = await context.request.json();
    const events = body.events || [];
    if (!Array.isArray(events) || events.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'No events' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const kv = context.env.DEPLOY_KV;
    const now = Date.now();
    const ttl = 60 * 60 * 24 * 30; // 30 days TTL

    // Write all events in parallel
    const writes = events.map((ev, i) => {
      const prefix = PREFIX_MAP[ev.event] || 'ev';
      // Key: analytics:{prefix}:{timestamp}:{session}:{index}
      const key = `analytics:${prefix}:${ev.timestamp}:${ev.session_id}:${i}`;
      return kv.put(key, JSON.stringify(ev), { expirationTtl: ttl });
    });

    // Also track unique sessions
    const sessions = new Set(events.map((e) => e.session_id));
    const sessionWrites = Array.from(sessions).map((sid) =>
      kv.put(`analytics:session:${sid}`, String(now), { expirationTtl: ttl })
    );

    await Promise.all([...writes, ...sessionWrites]);

    return new Response(JSON.stringify({ success: true, stored: events.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
