import React from 'react';
import { useStore } from '../state/store';
import { useDismissable } from '../utils/useDismissable';
import Logo from './Logo';
import IPInfoPopover from './IPInfoPopover';
import { MenuIcon } from './icons';

export default function TopBar() {
  const { state, dispatch } = useStore();
  const { open, setOpen, containerRef, triggerRef } = useDismissable<HTMLDivElement>();

  return (
    <header className="topbar">
      <div className="brand">
        <Logo size={30} />
        <span className="brand__name">Ghost Audit</span>
      </div>
      <div className="topbar__right">
        <IPInfoPopover />
        <div className="menu-wrap" ref={containerRef}>
          <button
            type="button"
            className="icon-btn"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label="Open account menu"
            ref={triggerRef}
            onClick={() => setOpen((v) => !v)}
          >
            <MenuIcon size={20} />
          </button>
          <div className="dropdown-menu" role="menu" hidden={!open} aria-label="Account menu">
            <button
              type="button"
              role="menuitemradio"
              aria-checked={state.theme === 'light'}
              aria-current={state.theme === 'light'}
              onClick={() => {
                dispatch({ type: 'SET_THEME', theme: 'light' });
                setOpen(false);
              }}
            >
              Light Theme
            </button>
            <button
              type="button"
              role="menuitemradio"
              aria-checked={state.theme === 'dark'}
              aria-current={state.theme === 'dark'}
              onClick={() => {
                dispatch({ type: 'SET_THEME', theme: 'dark' });
                setOpen(false);
              }}
            >
              Dark Theme
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
