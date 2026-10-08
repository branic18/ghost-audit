import React, { useId, useState } from 'react';

interface InfoTipProps {
  label: string;
  text: string;
}

/** Accessible info icon: shows a short description on hover, focus, or tap. */
export default function InfoTip({ label, text }: InfoTipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span
      className="info-tip"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="info-tip__trigger"
        aria-describedby={open ? id : undefined}
        aria-label={label}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
      >
        i
      </button>
      {open && (
        <span role="tooltip" id={id} className="info-tip__bubble">
          {text}
        </span>
      )}
    </span>
  );
}
