const base = import.meta.env.BASE_URL;

export function withBase(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('mailto:')) {
    return path;
  }

  const clean = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${clean}`;
}

export function isActivePath(currentPath: string, targetPath: string): boolean {
  const normalize = (value: string) => value.replace(/\/$/, '') || '/';
  const current = normalize(currentPath);
  const target = normalize(withBase(targetPath === '/' ? '' : targetPath));

  if (targetPath === '/') {
    return current === normalize(base);
  }

  return current === target;
}
