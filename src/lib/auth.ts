'use client';

const AUTH_KEY = 'awesome-auth-state';

export type UserTier = 'free' | 'pro' | 'team';

export interface UserState {
  email: string;
  tier: UserTier;
  servers: ServerInfo[];
  createdAt: string;
}

export interface ServerInfo {
  id: string;
  host: string;
  port: number;
  name: string;
  lastSeen: string;
  installedTools: DeployedToolInfo[];
}

export interface DeployedToolInfo {
  toolId: string;
  toolName: string;
  deployedAt: string;
  directory: string;
  status: 'running' | 'stopped' | 'unknown';
}

function getDefaultState(): UserState {
  return {
    email: '',
    tier: 'free',
    servers: [],
    createdAt: new Date().toISOString(),
  };
}

export function getAuthState(): UserState {
  if (typeof window === 'undefined') return getDefaultState();
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as UserState) : getDefaultState();
  } catch {
    return getDefaultState();
  }
}

export function setAuthState(state: UserState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_KEY, JSON.stringify(state));
}

export function upgradeTier(tier: UserTier) {
  const state = getAuthState();
  state.tier = tier;
  setAuthState(state);
}

export function addServer(server: Omit<ServerInfo, 'id' | 'lastSeen' | 'installedTools'>) {
  const state = getAuthState();
  const id = 'srv_' + Date.now().toString(36);
  state.servers.push({
    ...server,
    id,
    lastSeen: new Date().toISOString(),
    installedTools: [],
  });
  setAuthState(state);
  return id;
}

export function removeServer(id: string) {
  const state = getAuthState();
  state.servers = state.servers.filter((s) => s.id !== id);
  setAuthState(state);
}

export function addDeployedTool(serverId: string, toolId: string, toolName: string, directory: string) {
  const state = getAuthState();
  const server = state.servers.find((s) => s.id === serverId);
  if (server) {
    server.installedTools.push({
      toolId,
      toolName,
      deployedAt: new Date().toISOString(),
      directory,
      status: 'running',
    });
    server.lastSeen = new Date().toISOString();
    setAuthState(state);
  }
}

export function setEmail(email: string) {
  const state = getAuthState();
  state.email = email;
  setAuthState(state);
}

export function canDeploy(tier: UserTier): boolean {
  return tier === 'pro' || tier === 'team';
}

export function getServerLimit(tier: UserTier): number {
  if (tier === 'free') return 0;
  if (tier === 'pro') return 3;
  return Infinity; // team
}

export function resetAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_KEY);
}
