export const CMS_URL: string =
  (import.meta.env.VITE_CMS_URL as string | undefined) || 'http://localhost:4500';

export const getToken = (): string | null => sessionStorage.getItem('cms_token');
export const setToken = (t: string) => sessionStorage.setItem('cms_token', t);
export const clearToken = () => sessionStorage.removeItem('cms_token');

async function req<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${CMS_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || res.statusText);
  return data as T;
}

export interface ScreenInfo {
  id: string;
  nombre: string;
  recursos?: Array<{ id: string; nombre: string }>;
}

export interface MediaItem {
  name: string;
  url: string;
  size: number;
  ext: string;
}

export const api = {
  login: (user: string, pass: string) =>
    req<{ token: string; user: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ user, pass }),
    }),
  getScreens: () => req<ScreenInfo[]>('/api/screens'),
  getContent: (screen: string, recurso = 'principal') =>
    req<unknown>(`/api/content/${screen}${recurso === 'principal' ? '' : `/${recurso}`}`),
  saveContent: (screen: string, data: unknown, recurso = 'principal') =>
    req<{ ok: boolean }>(`/api/content/${screen}${recurso === 'principal' ? '' : `/${recurso}`}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getLanguages: (screen: string) => req<unknown>(`/api/languages/${screen}`),
  saveLanguages: (screen: string, data: unknown) =>
    req<{ ok: boolean }>(`/api/languages/${screen}`, { method: 'PUT', body: JSON.stringify(data) }),
  listMedia: (screen: string) => req<MediaItem[]>(`/api/media/${screen}`),
  uploadMedia: (screen: string, name: string, dataBase64: string) =>
    req<{ ok: boolean; name: string; url: string }>(`/api/media/${screen}`, {
      method: 'POST',
      body: JSON.stringify({ name, dataBase64 }),
    }),
  deleteMedia: (screen: string, name: string) =>
    req<{ ok: boolean }>(`/api/media/${screen}?name=${encodeURIComponent(name)}`, { method: 'DELETE' }),
};
