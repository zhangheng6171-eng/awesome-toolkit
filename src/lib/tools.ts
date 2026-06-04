import toolsData from '@/data/tools.json';

export type PlatformSupport = 'native' | 'docker' | 'web' | 'unsupported';

export interface Platforms {
  windows: PlatformSupport;
  linux: PlatformSupport;
  mac: PlatformSupport;
  nas: PlatformSupport;
  recommended: 'windows' | 'linux' | 'mac' | 'nas' | 'web' | 'all';
}

export interface SystemRequirements {
  min_ram_mb: number;
  min_disk_mb: number;
  recommended_ram_mb: number;
  recommended_disk_mb: number;
  cpu: 'low' | 'medium' | 'high';
  docker_required: boolean;
  gpu_beneficial: boolean;
  install_time_minutes: number;
  setup_complexity: 'simple' | 'moderate' | 'complex';
  setup_notes?: string;
}

export interface DeviceProfile {
  type: 'windows' | 'mac' | 'linux' | 'nas';
  ram_mb: number;
  has_docker: boolean;
  has_gpu: boolean;
}

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
  platforms: Platforms;
  platform_instructions?: Partial<Record<keyof Omit<Platforms, 'recommended'>, {
    steps: string[];
    prerequisites?: string;
    note?: string;
  }>>;
  system_requirements: SystemRequirements;
  beginner_friendly?: boolean;
}

export const DEVICE_LABELS: Record<DeviceProfile['type'], string> = {
  windows: 'Windows 电脑',
  mac: 'Mac 电脑',
  linux: 'Linux 服务器',
  nas: '群晖 NAS',
};

export const DEVICE_ICONS: Record<DeviceProfile['type'], string> = {
  windows: '🪟',
  mac: '🍎',
  linux: '🐧',
  nas: '🖥️',
};

export const RAM_PRESETS = [
  { value: 2048, label: '2 GB' },
  { value: 4096, label: '4 GB' },
  { value: 8192, label: '8 GB' },
  { value: 16384, label: '16 GB' },
  { value: 32768, label: '32 GB+' },
];

export function recommendForDevice(profile: DeviceProfile, tools: Tool[] = getAllTools()): Tool[] {
  return tools
    .filter((t) => {
      const p = t.platforms[profile.type];
      // Must be supported on this device type
      if (p === 'unsupported') return false;
      // If web-only, always show
      if (p === 'web') return true;
      // If requires Docker but user doesn't have it, demote (still show but scored lower)
      // Actually, docker-based tools on windows/mac can work via Docker Desktop, but we
      // need to check if user has Docker installed
      if (t.system_requirements.docker_required && !profile.has_docker) {
        // Allow but mark as needing docker
        if (profile.type !== 'nas') return true; // Windows/Mac can install Docker
        return false; // NAS without Docker can't run Docker tools
      }
      // RAM check: allow if recommended RAM fits, or min RAM fits
      if (profile.ram_mb < t.system_requirements.min_ram_mb) return false;
      return true;
    })
    .sort((a, b) => {
      // Sort by: beginner_friendly first, then RAM compatibility, then difficulty, then stars
      const aFits = profile.ram_mb >= a.system_requirements.recommended_ram_mb;
      const bFits = profile.ram_mb >= b.system_requirements.recommended_ram_mb;

      // Beginner friendly tools first
      const aBeginner = a.beginner_friendly ? 1 : 0;
      const bBeginner = b.beginner_friendly ? 1 : 0;
      if (aBeginner !== bBeginner) return bBeginner - aBeginner;

      // Tools that fit recommended RAM first
      if (aFits !== bFits) return bFits ? 1 : -1;

      // Lower difficulty first
      if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty;

      // Higher stars first
      return b.stars - a.stars;
    });
}

export function getRAMTierLabel(ramMb: number): string {
  if (ramMb <= 2048) return '低配（2GB）';
  if (ramMb <= 4096) return '入门（4GB）';
  if (ramMb <= 8192) return '中配（8GB）';
  return '高配（16GB+）';
}

export function formatRAM(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb} MB`;
}

export function formatDisk(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(0)} GB`;
  return `${mb} MB`;
}

export const PLATFORM_LABELS: Record<string, string> = {
  windows: 'Windows',
  linux: 'Linux',
  mac: 'Mac',
  nas: 'NAS (Synology)',
  native: '原生安装',
  docker: 'Docker',
  web: '浏览器',
  unsupported: '不支持',
  recommended: '推荐',
  all: '全平台',
};

export function getPlatformBadge(p: PlatformSupport): { label: string; color: string } {
  switch (p) {
    case 'native': return { label: '原生', color: 'bg-green-100 text-green-700' };
    case 'docker': return { label: 'Docker', color: 'bg-blue-100 text-blue-700' };
    case 'web': return { label: '网页', color: 'bg-purple-100 text-purple-700' };
    case 'unsupported': return { label: '不支持', color: 'bg-gray-100 text-gray-400' };
  }
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
