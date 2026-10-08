import React, { useEffect, useState } from 'react';
import { useStore } from '../state/store';
import { fetchBreaches } from '../api';
import { generateRecordsForEmail } from '../data/mockRecords';
import { DEMO_EMAILS, DEMO_NOTICE } from '../demo';

const SEARCH_DURATION_MS = 1600;

export function EmptyStatePanel() {
  const { dispatch } = useStore();

  function runDemoScan(email: string) {
    dispatch({ type: 'SEARCH_START', email });
    const started = Date.now();
    fetchBreaches(email)
      .catch(() => generateRecordsForEmail(email))
      .then((records) => {
        const wait = Math.max(0, SEARCH_DURATION_MS - (Date.now() - started));
        window.setTimeout(() => {
          dispatch({ type: 'SEARCH_DONE', email, records });
        }, wait);
      });
  }

  return (
    <div className="state-panel">
      <p>
        Enter a <strong>demo email</strong> to scan synthetic breach records, then flag accounts to
        your action list to secure them.
      </p>
      <p className="demo-hint">{DEMO_NOTICE}</p>
      <div className="demo-email-row">
        {DEMO_EMAILS.map((email) => (
          <button
            key={email}
            type="button"
            className="btn btn-secondary"
            onClick={() => runDemoScan(email)}
          >
            {email}
          </button>
        ))}
      </div>
    </div>
  );
}

export function LoadingStatePanel() {
  const [pct, setPct] = useState(8);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPct((p) => (p >= 92 ? p : p + Math.max(2, Math.round((100 - p) / 8))));
    }, 180);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="state-panel" role="status" aria-live="polite">
      <p>Scanning across websites…</p>
      <div className="progress-track" aria-hidden="true">
        <span style={{ width: `${pct}%` }} />
      </div>
      <span className="visually-hidden">{pct}% complete</span>
    </div>
  );
}
