export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function softwareApplicationSchema(tool: {
  name: string;
  description_plain: string;
  github_url: string;
  stars: number;
  tags: string[];
  license?: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description_plain,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Linux',
    url: tool.github_url,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
    aggregateRating: tool.stars
      ? {
          '@type': 'AggregateRating',
          ratingValue: Math.min(5, Math.round(tool.stars / 20000 * 5 * 10) / 10),
          ratingCount: tool.stars,
          bestRating: 5,
        }
      : undefined,
    keywords: tool.tags?.join(', '),
    license: tool.license || undefined,
  };
}

export function webSiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Awesome Toolkit',
    url: 'https://awesome-toolkit.pages.dev',
    description: '从 GitHub 精选 50+ 最强开源工具，提供一键部署方案和普通人能看懂的使用说明。',
    inLanguage: 'zh-CN',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://awesome-toolkit.pages.dev/?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function itemListSchema(items: Array<{
  name: string;
  url: string;
  description: string;
}>): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'SoftwareApplication',
        name: item.name,
        url: item.url,
        description: item.description,
      },
    })),
  };
}
