// Web-only shadow utilities — React Native version replaced for web build.
// The admin and staff portals use inline CSS box-shadow instead.

export const shadowSm = { boxShadow: '0 1px 3px rgba(0,0,0,0.08)' };
export const shadowMd = { boxShadow: '0 2px 8px rgba(0,0,0,0.10)'  };
export const shadowLg = { boxShadow: '0 4px 16px rgba(0,0,0,0.12)' };

export function shadow(level: 'sm' | 'md' | 'lg' = 'md') {
  if (level === 'sm') return shadowSm;
  if (level === 'lg') return shadowLg;
  return shadowMd;
}
