import React from 'react';
import logoUrl from '../assets/ghost-audit-logo.png';

/** Ghost Audit mark, matching the Figma asset's native 37 × 30 size. */
export default function Logo({ size = 26 }: { size?: number }) {
  return <img src={logoUrl} alt="" width={size} height={(size * 30) / 37} className="brand__logo" />;
}
