import React from 'react';
import type { ChecklistItem } from '../types';

interface ChecklistProps {
  items: ChecklistItem[];
  onToggle?: (id: string) => void;
  readOnly?: boolean;
  legend: string;
}

export default function Checklist({ items, onToggle, readOnly, legend }: ChecklistProps) {
  return (
    <fieldset className={`checklist${readOnly ? ' readonly' : ''}`} style={{ border: 'none', padding: 0, margin: '12px 0 16px' }}>
      <legend className="visually-hidden">{legend}</legend>
      <ul className="checklist">
        {items.map((item) => {
          const inputId = `chk-${item.id}`;
          return (
            <li key={item.id}>
              <input
                id={inputId}
                type="checkbox"
                checked={item.checked}
                disabled={readOnly}
                onChange={() => onToggle?.(item.id)}
              />
              <label htmlFor={inputId}>{item.label}</label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
