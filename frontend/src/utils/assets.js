export function getAssetUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const origin = import.meta.env.VITE_API_ORIGIN || 'http://localhost:4000';
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}
