/**
 * Collapsible Section Component
 * Expandable/collapsible panel wrapper
 */

import { useState } from 'react';
import type { ReactNode } from 'react';

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="section-card">
      <button
        type="button"
        className="section-header"
        onClick={() => setOpen(prev => !prev)}
        aria-expanded={open}
      >
        <span className="section-title">{title}</span>
        <span className="section-toggle">{open ? '-' : '+'}</span>
      </button>
      {open && <div className="section-content">{children}</div>}
    </section>
  );
}
