import React, { useState } from 'react';
import { useStore } from '../state/store';
import { useDismissable } from '../utils/useDismissable';
import { fetchBreaches } from '../api';
import { generateRecordsForEmail } from '../data/mockRecords';
import InfoTip from './InfoTip';
import { ShieldLockIcon, SearchIcon, ArchiveIcon, ChevronDownIcon } from './icons';
import { DEMO_EMAILS, DEMO_NOTICE } from '../demo';

const SEARCH_DURATION_MS = 1600;

export default function SearchHeader() {
  const { state, dispatch } = useStore();
  const [draft, setDraft] = useState('');
  const { open, setOpen, containerRef, triggerRef } = useDismissable<HTMLDivElement>();

  const showSearchBox = state.view === 'empty' || state.view === 'loading';

  function submitSearch(email: string) {
    const trimmed = email.trim();
    if (!trimmed) return;
    dispatch({ type: 'SEARCH_START', email: trimmed });
    const started = Date.now();
    fetchBreaches(trimmed)
      .catch(() => generateRecordsForEmail(trimmed))
      .then((records) => {
        const wait = Math.max(0, SEARCH_DURATION_MS - (Date.now() - started));
        window.setTimeout(() => {
          dispatch({ type: 'SEARCH_DONE', email: trimmed, records });
        }, wait);
      });
  }

  const heading = state.view === 'archives' ? 'Archives' : 'Data Breach Monitor';

  return (
    <div className="section-header">
      <h1 className="section-title">
        <span className="section-title__icon">
          <ShieldLockIcon size={22} />
        </span>
        {heading}
        <InfoTip
          label="About this section"
          text={`${DEMO_NOTICE} Sample addresses such as ${DEMO_EMAILS[0]} load synthetic results.`}
        />
      </h1>

      {showSearchBox ? (
        <div className="search-cluster">
          <form
            className="search-box"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch(draft);
            }}
          >
            <SearchIcon size={16} className="search-box__icon" />
            <label htmlFor="email-search-input" className="visually-hidden">
              Demo email address to scan
            </label>
            <input
              id="email-search-input"
              type="email"
              placeholder={DEMO_EMAILS[0]}
              value={state.view === 'loading' ? state.currentEmail ?? '' : draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={state.view === 'loading'}
            />
            {state.view !== 'loading' && (
              <button type="submit" className="go" aria-label="Scan the web for this email">
                Go
              </button>
            )}
          </form>
          <p className="demo-hint search-cluster__hint">{DEMO_NOTICE}</p>
        </div>
      ) : (
        <div className="email-dropdown" ref={containerRef}>
          <button
            type="button"
            className="email-dropdown__trigger"
            aria-haspopup="menu"
            aria-expanded={open}
            ref={triggerRef}
            onClick={() => setOpen((v) => !v)}
          >
            <span>{state.view === 'archives' ? 'Archives' : state.currentEmail}</span>
            <ChevronDownIcon size={16} className={`dropdown-caret${open ? ' is-open' : ''}`} />
          </button>
          <div className="email-dropdown__list" role="menu" hidden={!open}>
            {state.emailOrder.map((email) => (
              <button
                key={email}
                type="button"
                role="menuitemradio"
                aria-checked={state.view === 'results' && state.currentEmail === email}
                aria-current={state.view === 'results' && state.currentEmail === email}
                onClick={() => {
                  dispatch({ type: 'SELECT_EMAIL', email });
                  setOpen(false);
                }}
              >
                {email}
              </button>
            ))}
            <button
              type="button"
              role="menuitem"
              aria-current={state.view === 'archives'}
              onClick={() => {
                dispatch({ type: 'SHOW_ARCHIVES' });
                setOpen(false);
              }}
            >
              <ArchiveIcon size={16} /> Archive
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                dispatch({ type: 'START_NEW_SCAN' });
                setDraft('');
                setOpen(false);
              }}
            >
              <SearchIcon size={16} /> Scan the web
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
