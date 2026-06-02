import toolsData from '@/data/tools.json';

export interface Tool {
  id: string;
  name: string;
  github_url: string;
  stars: number;
  category: string;
  tags: string[];
  description_plain: string;
  target_users: string[];
  difficulty: number;
  quick_start: string[];
  alternatives?: string[];
  useCase?: string;
  has_web_ui: boolean;
  has_desktop_app: boolean;
  has_cli: boolean;
  license?: string;
  added_date?: string;
  last_updated?: string;
}

export function getAllTools(): Tool[] {
  return toolsData as Tool[];
}

export function getToolById(id: string): Tool | undefined {
  return (toolsData as Tool[]).find((t) => t.id === id);
}

export function getToolsByCategory(category: string): Tool[] {
  return (toolsData as Tool[]).filter((t) => t.category === category);
}

export function getUniqueCategories(): string[] {
  const cats = new Set((toolsData as Tool[]).map((t) => t.category));
  return Array.from(cats);
}

export function getUniqueTags(): string[] {
  const tags = new Set<string>();
  (toolsData as Tool[]).forEach((t) => t.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags).sort();
}

export interface FilterOptions {
  search: string;
  category: string;
  difficulty: number | null;
  targetUser: string;
  license: string;
  hasWebUI: boolean | null;
}

export function filterTools(options: FilterOptions): Tool[] {
  let result = getAllTools();

  if (options.search) {
    const q = options.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description_plain.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  if (options.category) {
    result = result.filter((t) => t.category === options.category);
  }

  if (options.difficulty !== null) {
    result = result.filter((t) => t.difficulty === options.difficulty);
  }

  if (options.targetUser) {
    result = result.filter((t) => t.target_users.includes(options.targetUser));
  }

  if (options.license) {
    result = result.filter((t) => t.license === options.license);
  }

  if (options.hasWebUI !== null) {
    result = result.filter((t) => t.has_web_ui === options.hasWebUI);
  }

  return result;
}

export function formatStarCount(stars: number): string {
  if (stars >= 1000) {
    const n = stars / 1000;
    if (n % 1 === 0) return n + 'k';
    return n.toFixed(1) + 'k';
  }
  return String(stars);
}

export function renderDifficultyStars(difficulty: number): string {
  return '⭐'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
}
