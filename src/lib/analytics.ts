// Client-side analytics tracker
// Sends events to /api/analytics/track via fetch (fire-and-forget)
// Session persisted in localStorage, survives page refreshes

const SESSION_KEY = 'at_session';
const EVENTS_KEY = 'at_queue';

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = window.localStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

export function getSession(): { id: string } {
  return { id: getSessionId() };
}

interface EventPayload {
  event: string;
  page: string;
  tool_id?: string;
  device?: string;
  referrer: string;
  timestamp: number;
  session_id: string;
}

let queue: EventPayload[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

function flush() {
  if (queue.length === 0) return;
  const batch = queue.splice(0);
  fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ events: batch }),
    keepalive: true,
  }).catch(() => {
    // Re-queue on failure (up to 2x)
    if (queue.length < 100) queue.push(...batch);
  });
}

export function track(
  event: string,
  props?: { tool_id?: string; device?: string }
) {
  if (typeof window === 'undefined') return;
  const payload: EventPayload = {
    event,
    page: window.location.pathname,
    tool_id: props?.tool_id,
    device: props?.device,
    referrer: document.referrer || '',
    timestamp: Date.now(),
    session_id: getSessionId(),
  };
  queue.push(payload);

  // Flush immediately for deploy events, batch for others
  if (event === 'deploy_complete') {
    flush();
  } else if (!timer) {
    timer = setTimeout(() => {
      flush();
      timer = null;
    }, 2000);
  }
}

// Page view tracking moved to PageViewTracker component (layout-level)
// This ensures it fires on every route change, not just on first import
