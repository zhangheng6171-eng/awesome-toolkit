export interface CompareDimension {
  key: string;
  label: string;
  render: (value: unknown) => string;
}

export const COMPARE_DIMENSIONS: CompareDimension[] = [
  {
    key: 'stars',
    label: 'GitHub Stars',
    render: (v) => (typeof v === 'number' ? (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)) : '-'),
  },
  {
    key: 'category',
    label: '分类',
    render: (v) => String(v ?? '-'),
  },
  {
    key: 'description_plain',
    label: '一句话描述',
    render: (v) => String(v ?? '-'),
  },
  {
    key: 'difficulty',
    label: '安装难度',
    render: (v) => (typeof v === 'number' ? '⭐'.repeat(v) + '☆'.repeat(5 - v) : '-'),
  },
  {
    key: 'target_users',
    label: '适合人群',
    render: (v) => (Array.isArray(v) ? v.join('、') : '-'),
  },
  {
    key: 'license',
    label: '许可证',
    render: (v) => String(v ?? '未标注'),
  },
  {
    key: 'has_web_ui',
    label: 'Web 界面',
    render: (v) => (v ? '✅ 有' : '❌ 无'),
  },
  {
    key: 'has_desktop_app',
    label: '桌面 App',
    render: (v) => (v ? '✅ 有' : '❌ 无'),
  },
  {
    key: 'has_cli',
    label: '命令行工具',
    render: (v) => (v ? '✅ 有' : '❌ 无'),
  },
  {
    key: 'quick_start_steps',
    label: '上手步骤',
    render: (v) => (typeof v === 'number' ? `${v} 步` : '-'),
  },
  {
    key: 'alternatives',
    label: '同类替代品',
    render: (v) => (Array.isArray(v) && v.length > 0 ? v.join('、') : '-'),
  },
];

export function buildCompareData(tools: Record<string, unknown>[]) {
  const rows: { dimension: CompareDimension; values: string[] }[] = [];

  for (const dim of COMPARE_DIMENSIONS) {
    const values = tools.map((tool) => {
      let val = tool[dim.key];

      // Special computed fields
      if (dim.key === 'quick_start_steps') {
        const steps = tool['quick_start'] as unknown[];
        val = Array.isArray(steps) ? steps.length : 0;
      }

      return dim.render(val);
    });
    rows.push({ dimension: dim, values });
  }

  return rows;
}
