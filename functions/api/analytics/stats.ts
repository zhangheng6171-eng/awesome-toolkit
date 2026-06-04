// GET /api/analytics/stats — aggregated analytics
// Lists KV keys by prefix to count events per type, tools, devices

interface Env {
  DEPLOY_KV: KVNamespace;
}

interface Stats {
  events: Record<string, number>;
  sessions: number;
  tools: Record<string, number>;
  devices: Record<string, number>;
  pages: Record<string, number>;
  funnel: {
    page_view: number;
    wizard_open: number;
    device_select: number;
    tool_click: number;
    deploy_start: number;
    deploy_complete: number;
  };
  recent_events: Array<Record<string, unknown>>;
}

export async function onRequest(context: { request: Request; env: Env }) {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const kv = context.env.DEPLOY_KV;

    // List all analytics keys
    const list = await kv.list({ prefix: 'analytics:' });

    const stats: Stats = {
      events: {},
      sessions: 0,
      tools: {} as Record<string, number>,
      devices: {} as Record<string, number>,
      pages: {} as Record<string, number>,
      funnel: {
        page_view: 0,
        wizard_open: 0,
        device_select: 0,
        tool_click: 0,
        deploy_start: 0,
        deploy_complete: 0,
      },
      recent_events: [],
    };

    // Count events by prefix
    const prefixCounts: Record<string, number> = {};
    for (const key of list.keys) {
      const parts = key.name.split(':');
      // analytics:{prefix}:{ts}:{sid}:{idx}
      if (parts.length >= 3 && parts[0] === 'analytics') {
        const prefix = parts[1];
        prefixCounts[prefix] = (prefixCounts[prefix] || 0) + 1;
      }
    }

    // Map prefixes back to event names
    stats.events['page_view'] = prefixCounts['pv'] || 0;
    stats.events['wizard_open'] = prefixCounts['wiz'] || 0;
    stats.events['device_select'] = prefixCounts['dev'] || 0;
    stats.events['tool_click'] = prefixCounts['tool'] || 0;
    stats.events['deploy_start'] = prefixCounts['deps'] || 0;
    stats.events['deploy_complete'] = prefixCounts['done'] || 0;

    stats.funnel = {
      page_view: prefixCounts['pv'] || 0,
      wizard_open: prefixCounts['wiz'] || 0,
      device_select: prefixCounts['dev'] || 0,
      tool_click: prefixCounts['tool'] || 0,
      deploy_start: prefixCounts['deps'] || 0,
      deploy_complete: prefixCounts['done'] || 0,
    };

    // Count sessions
    let sessionCount = 0;
    for (const key of list.keys) {
      if (key.name.startsWith('analytics:session:')) {
        sessionCount++;
      }
    }
    stats.sessions = sessionCount;

    // Read tool_click events for per-tool counts (limit to 100 for perf)
    const toolKeys = list.keys.filter((k) => k.name.startsWith('analytics:tool:')).slice(0, 200);
    const deviceKeys = list.keys.filter((k) => k.name.startsWith('analytics:dev:')).slice(0, 200);
    const pageKeys = list.keys.filter((k) => k.name.startsWith('analytics:pv:')).slice(0, 200);
    const recentKeys = list.keys
      .filter((k) => !k.name.includes(':session:'))
      .sort((a, b) => b.name.localeCompare(a.name))
      .slice(0, 20);

    // Read tool events
    if (toolKeys.length > 0) {
      const toolEntries = await Promise.all(toolKeys.map((k) => kv.get(k.name).catch(() => null)));
      for (const entry of toolEntries) {
        if (!entry) continue;
        try {
          const ev = JSON.parse(entry);
          if (ev.tool_id) {
            stats.tools[ev.tool_id] = (stats.tools[ev.tool_id] || 0) + 1;
          }
        } catch { /* skip */ }
      }
    }

    // Read device events
    if (deviceKeys.length > 0) {
      const deviceEntries = await Promise.all(deviceKeys.map((k) => kv.get(k.name).catch(() => null)));
      for (const entry of deviceEntries) {
        if (!entry) continue;
        try {
          const ev = JSON.parse(entry);
          if (ev.device) {
            stats.devices[ev.device] = (stats.devices[ev.device] || 0) + 1;
          }
        } catch { /* skip */ }
      }
    }

    // Read page view events for page distribution
    if (pageKeys.length > 0) {
      const pageEntries = await Promise.all(pageKeys.map((k) => kv.get(k.name).catch(() => null)));
      for (const entry of pageEntries) {
        if (!entry) continue;
        try {
          const ev = JSON.parse(entry);
          if (ev.page) {
            stats.pages[ev.page] = (stats.pages[ev.page] || 0) + 1;
          }
        } catch { /* skip */ }
      }
    }

    // Recent events for live feed
    if (recentKeys.length > 0) {
      const recentEntries = await Promise.all(recentKeys.map((k) => kv.get(k.name).catch(() => null)));
      for (const entry of recentEntries) {
        if (!entry) continue;
        try {
          stats.recent_events.push(JSON.parse(entry));
        } catch { /* skip */ }
      }
    }

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
