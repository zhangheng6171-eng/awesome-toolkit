import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const DATA_FILE = resolve(process.cwd(), 'data', 'waitlist.json');

type WaitlistEntry = { email: string; source: string; createdAt: string };

function readWaitlist(): WaitlistEntry[] {
  try {
    if (existsSync(DATA_FILE)) {
      return JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch {
    // ignore
  }
  return [];
}

function writeWaitlist(entries: WaitlistEntry[]) {
  const dir = resolve(process.cwd(), 'data');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(entries, null, 2) + '\n', 'utf-8');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email?.trim().toLowerCase();
    const source = body.source || 'website';

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: '请输入有效的邮箱地址' }, { status: 400 });
    }

    const entries = readWaitlist();
    if (entries.some((e) => e.email === email)) {
      return NextResponse.json({ success: true, message: 'already_registered' });
    }

    entries.push({ email, source, createdAt: new Date().toISOString() });
    writeWaitlist(entries);

    console.log(`[Waitlist] New: ${email} from ${source} (total: ${entries.length})`);
    return NextResponse.json({ success: true, total: entries.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function GET() {
  const entries = readWaitlist();
  return NextResponse.json({ total: entries.length });
}
