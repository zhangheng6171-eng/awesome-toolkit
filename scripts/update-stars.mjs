import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const toolsPath = resolve(__dirname, '..', 'src', 'data', 'tools.json');

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error('GITHUB_TOKEN is not set');
  process.exit(1);
}

function parseRepo(url) {
  const m = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)$/);
  if (!m) return null;
  return { owner: m[1], repo: m[2] };
}

async function fetchStars(owner, repo) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (res.status === 403) {
    const remaining = res.headers.get('x-ratelimit-remaining');
    if (remaining === '0') {
      const resetAt = new Date((+res.headers.get('x-ratelimit-reset') || 0) * 1000);
      console.error(`Rate limit exhausted, resets at ${resetAt.toISOString()}`);
      throw new Error('Rate limited');
    }
  }

  if (!res.ok) {
    console.error(`Failed to fetch ${owner}/${repo}: ${res.status} ${res.statusText}`);
    return null;
  }

  const data = await res.json();
  return data.stargazers_count ?? null;
}

async function main() {
  console.log(`Reading tools from: ${toolsPath}`);
  const tools = JSON.parse(readFileSync(toolsPath, 'utf-8'));

  let updated = 0;
  let failed = 0;

  for (const tool of tools) {
    const parsed = parseRepo(tool.github_url);
    if (!parsed) {
      console.log(`Skipping ${tool.name}: invalid URL ${tool.github_url}`);
      failed++;
      continue;
    }
    const { owner, repo } = parsed;
    console.log(`Fetching stars for ${owner}/${repo}...`);
    const stars = await fetchStars(owner, repo);

    if (stars !== null) {
      const oldStars = tool.stars;
      tool.stars = stars;
      const delta = stars - oldStars;
      const sign = delta >= 0 ? '+' : '';
      console.log(`  ${owner}/${repo}: ${oldStars} → ${stars} (${sign}${delta})`);
      updated++;
    } else {
      console.log(`  ${owner}/${repo}: FAILED (keeping ${tool.stars})`);
      failed++;
    }

    // Sleep 200ms between requests to be kind to the API
    await new Promise((r) => setTimeout(r, 200));
  }

  writeFileSync(toolsPath, JSON.stringify(tools, null, 2) + '\n', 'utf-8');
  console.log(`\nDone. Updated: ${updated}, Failed: ${failed}, Total: ${tools.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
