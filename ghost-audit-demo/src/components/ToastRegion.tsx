import React, { useEffect } from 'react';
import { useStore } from '../state/store';
import { CloseIcon } from './icons';

const AUTO_DISMISS_MS = 6000;

export default function ToastRegion() {
  const { state, dispatch } = useStore();

  useEffect(() => {
    const timers = state.toasts.map((t) =>
      setTimeout(() => dispatch({ type: 'REMOVE_TOAST', id: t.id }), AUTO_DISMISS_MS),
    );
    return () => timers.forEach(clearTimeout);
  }, [state.toasts, dispatch]);

  return (
    <div className="toast-region" role="status" aria-live="polite">
      {state.toasts.map((t) => (
        <div className="toast" key={t.id}>
          <div className="toast__body">
            <strong>{t.title}</strong>
            <span>{t.body}</span>
          </div>
          <button
            type="button"
            className="toast__close"
            aria-label="Dismiss notification"
            onClick={() => dispatch({ type: 'REMOVE_TOAST', id: t.id })}
          >
            <CloseIcon size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
