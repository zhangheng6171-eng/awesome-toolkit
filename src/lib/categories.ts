export interface CategoryInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'AI & 自动化', name: 'AI & 自动化', icon: '🤖', color: '#7c3aed' },
  { id: '开发效率工具', name: '开发效率工具', icon: '🛠️', color: '#2563eb' },
  { id: '数据处理 & 可视化', name: '数据处理 & 可视化', icon: '📊', color: '#0891b2' },
  { id: '安全 & 隐私', name: '安全 & 隐私', icon: '🔒', color: '#059669' },
  { id: '网络 & 爬虫', name: '网络 & 爬虫', icon: '🌐', color: '#ea580c' },
  { id: '创意 & 媒体处理', name: '创意 & 媒体处理', icon: '🎨', color: '#db2777' },
  { id: '文件 & 知识管理', name: '文件 & 知识管理', icon: '📁', color: '#ca8a04' },
  { id: '自部署 & 家庭服务器', name: '自部署 & 家庭服务器', icon: '🏠', color: '#4f46e5' },
];

export function getCategoryInfo(categoryName: string): CategoryInfo {
  return CATEGORIES.find((c) => c.id === categoryName) ?? {
    id: categoryName,
    name: categoryName,
    icon: '📦',
    color: '#6b7280',
  };
}
