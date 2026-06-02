import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const toolsPath = resolve(__dirname, '..', 'src', 'data', 'tools.json');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY is not set');
  console.error('Get your key at: https://console.anthropic.com/');
  process.exit(1);
}

const SHORT_DESC_THRESHOLD = 50; // 字符数低于此值需要改进

async function generateDescription(tool) {
  const prompt = `你是一个面向中国普通用户（非技术人员）的科技工具说明撰写专家。

请为以下开源工具撰写一段「普通人能看懂的简要说明」，要求：
- 用中文
- 不超过80个汉字
- 用日常生活的比喻来解释（比如"像...一样"）
- 不要说"基于什么技术""用什么语言开发"这类技术词
- 重点说这个工具能帮人做什么、解决什么生活/工作中的问题

工具名称：${tool.name}
工具分类：${tool.category}
标签：${tool.tags.join('、')}
现有描述：${tool.description_plain}

请直接输出一段新的中文描述，不需要任何前缀或标点：`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      temperature: 0.7,
      system: '你是一个帮助中国普通用户理解科技工具的写作助手。输出简洁、准确、好懂。',
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    console.error(`  API error: ${res.status} ${res.statusText}`);
    return null;
  }

  const data = await res.json();
  return data.content[0].text.trim();
}

async function generateQuickStart(tool) {
  const prompt = `请为以下开源工具撰写「给普通用户看的使用步骤」，要求：
- 用中文
- 每步一句话，共 4-5 步
- 从用户第一次接触这个工具的角度出发（下载、安装、打开、第一次使用）
- 每步用日常用语，不要出现"执行命令""配置参数"这类词
- 如果这步确实需要在终端输入命令，把命令原样写上

工具名称：${tool.name}
工具分类：${tool.category}
现存步骤：${JSON.stringify(tool.quick_start)}

请输出 4-5 行，每行一个步骤，无需编号前缀：`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      temperature: 0.7,
      system: '你是一个帮助中国普通用户理解科技工具的写作助手。',
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    console.error(`  API error (quick_start): ${res.status} ${res.statusText}`);
    return null;
  }

  const data = await res.json();
  const text = data.content[0].text.trim();
  return text.split('\n').filter((l) => l.trim().length > 0);
}

async function main() {
  console.log(`Reading tools from: ${toolsPath}`);
  const tools = JSON.parse(readFileSync(toolsPath, 'utf-8'));

  const dryRun = process.argv.includes('--dry-run');
  const doQuickStart = process.argv.includes('--with-steps');
  const force = process.argv.includes('--force');

  if (dryRun) console.log('🔍 DRY RUN 模式（不会修改文件）\n');

  let generated = 0;
  let skipped = 0;
  const suggestions = [];

  for (const tool of tools) {
    const descLen = tool.description_plain.length;

    if (!force && descLen >= SHORT_DESC_THRESHOLD && tool.quick_start.length >= 4) {
      console.log(`⏭️  ${tool.name}: 描述已足够 (${descLen}字, ${tool.quick_start.length}步)`);
      skipped++;
      continue;
    }

    const reason = descLen < SHORT_DESC_THRESHOLD ? `描述偏短(${descLen}字)` : '';
    const stepReason = tool.quick_start.length < 4 ? `步骤偏少(${tool.quick_start.length}步)` : '';
    const reasons = [reason, stepReason].filter(Boolean).join(', ');
    console.log(`🔄 ${tool.name}: ${reasons}`);

    // Generate description if short
    let newDesc = null;
    if (force || descLen < SHORT_DESC_THRESHOLD) {
      console.log('  → 生成新描述...');
      newDesc = await generateDescription(tool);
      if (newDesc) {
        console.log(`  ✓ 新描述: ${newDesc}`);
        suggestions.push({ id: tool.id, name: tool.name, field: 'description_plain', old: tool.description_plain, new: newDesc });
      }
      await new Promise((r) => setTimeout(r, 500));
    }

    // Generate quick start steps if requested
    let newSteps = null;
    if (doQuickStart && (force || tool.quick_start.length < 4)) {
      console.log('  → 生成新步骤...');
      newSteps = await generateQuickStart(tool);
      if (newSteps) {
        console.log(`  ✓ 新步骤: ${newSteps.length} 步`);
        suggestions.push({ id: tool.id, name: tool.name, field: 'quick_start', old: tool.quick_start, new: newSteps });
      }
      await new Promise((r) => setTimeout(r, 500));
    }

    if (!dryRun && newDesc) {
      tool.description_plain = newDesc;
    }
    if (!dryRun && newSteps) {
      tool.quick_start = newSteps;
    }

    generated++;
  }

  // Save results
  if (!dryRun && suggestions.length > 0) {
    writeFileSync(toolsPath, JSON.stringify(tools, null, 2) + '\n', 'utf-8');
    console.log(`\n✅ 已更新 ${suggestions.length} 处修改到 tools.json`);
  }

  // Save suggestions report
  const reportPath = resolve(__dirname, '..', 'description-suggestions.json');
  writeFileSync(reportPath, JSON.stringify(suggestions, null, 2) + '\n', 'utf-8');
  console.log(`📋 建议报告已保存到: ${reportPath}`);

  console.log(`\nDone. Generated: ${generated}, Skipped: ${skipped}, Total: ${tools.length}`);

  if (dryRun) {
    console.log('\n💡 这是 DRY RUN。要实际修改文件，去掉 --dry-run 参数运行。');
    console.log('   node scripts/generate-descriptions.mjs');
    console.log('   加上 --with-steps 同时改进使用步骤');
    console.log('   加上 --force 强制重写所有描述');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
