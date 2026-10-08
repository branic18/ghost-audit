import React, { useLayoutEffect, useRef } from 'react';

interface Props {
  open: boolean;
  id: string;
  className: string;
  children: React.ReactNode;
}

/**
 * Open/close uses the grid-template-rows transition in CSS. While open, the row
 * is pinned to the panel's measured height so it grows and shrinks with the
 * content (for example when a notice is moved onto the action list).
 */
export default function AccordionPanel({ open, id, className, children }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const panel = panelRef.current;
    if (!wrap || !panel) return;

    const measure = () => {
      const previous = wrap.style.gridTemplateRows;
      wrap.style.transition = 'none';
      wrap.style.gridTemplateRows = 'auto';
      const height = panel.offsetHeight;
      wrap.style.gridTemplateRows = previous;
      wrap.style.transition = '';
      return height;
    };

    const sync = () => {
      if (!open) {
        wrap.style.gridTemplateRows = '0fr';
        return;
      }
      const measured = measure();
      const next = measured > 0 ? `${measured}px` : '1fr';
      if (wrap.style.gridTemplateRows !== next) {
        wrap.style.gridTemplateRows = next;
      }
    };

    sync();
    if (!open) return;

    const observer = new ResizeObserver(sync);
    observer.observe(panel);
    return () => observer.disconnect();
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className={`accordion-panel-wrap${open ? ' is-open' : ''}`}
      aria-hidden={!open}
      inert={!open}
    >
      <div className="accordion-panel-inner">
        <div ref={panelRef} className={className} id={id}>
          {children}
        </div>
      </div>
    </div>
  );
}
