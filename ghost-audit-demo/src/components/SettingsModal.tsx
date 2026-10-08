import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../state/store';
import { EditIcon } from './icons';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function SettingsModal() {
  const { state, dispatch, pushToast } = useStore();
  const target = state.settingsTarget;
  const record = target ? state.workspaces[target.email]?.find((r) => r.id === target.recordId) : null;

  const modalRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const initialGoal = useMemo<'Secure' | 'Delete' | null>(() => {
    if (!record) return null;
    if (record.selection === 'PreSelectDelete' || record.selection === 'Delete') return 'Delete';
    if (record.selection === 'PreSelectSecure' || record.selection === 'Secure') return 'Secure';
    return null;
  }, [record]);

  const [goal, setGoal] = useState<'Secure' | 'Delete' | null>(initialGoal);
  const [notesMode, setNotesMode] = useState<'add' | 'edit'>(record?.notesText ? 'edit' : 'add');
  const [notesDraft, setNotesDraft] = useState(record?.notesText ?? '');

  useEffect(() => {
    setGoal(initialGoal);
    setNotesMode(record?.notesText ? 'edit' : 'add');
    setNotesDraft(record?.notesText ?? '');
    setShowDiscardConfirm(false);
  }, [record?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!target) return undefined;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const modalEl = modalRef.current;
    const focusables = modalEl?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    focusables?.[0]?.focus();

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        requestClose();
        return;
      }
      if (e.key === 'Tab' && modalEl) {
        const items = Array.from(modalEl.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
          (el) => el.offsetParent !== null,
        );
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', handleKey, true);
    return () => {
      document.removeEventListener('keydown', handleKey, true);
      previouslyFocused.current?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.recordId]);

  if (!target || !record) return null;

  const dirty = goal !== initialGoal || notesDraft !== (record.notesText ?? '');

  function requestClose() {
    if (dirty) {
      setShowDiscardConfirm(true);
    } else {
      dispatch({ type: 'CLOSE_SETTINGS' });
    }
  }

  function discardAndClose() {
    setShowDiscardConfirm(false);
    dispatch({ type: 'CLOSE_SETTINGS' });
  }

  function handleSave() {
    dispatch({
      type: 'SAVE_SETTINGS',
      email: target!.email,
      recordId: target!.recordId,
      selection: goal,
      notesText: notesDraft,
    });
    pushToast('Notes saved', `Your ${record.domain} notes were successfully saved!`);
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && requestClose()}>
      <div
        className="modal modal-wrapper"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        ref={modalRef}
      >
        <h2 id="settings-modal-title">Settings | {record.domain}</h2>
        <hr />

        <div className="modal-section">
          <p className="label">Item type:</p>
          <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend className="visually-hidden">Remediation goal for {record.domain}</legend>
            <label className="radio-field">
              <input
                type="radio"
                name="settings-goal"
                checked={goal === 'Secure'}
                onChange={() => setGoal('Secure')}
              />
              <span className="radio-field__text">
                <strong>Secure account</strong>
                <span>You're keeping this account and want to make it secure</span>
              </span>
            </label>
            <label className="radio-field">
              <input
                type="radio"
                name="settings-goal"
                checked={goal === 'Delete'}
                onChange={() => setGoal('Delete')}
              />
              <span className="radio-field__text">
                <strong>Delete account</strong>
                <span>You want to delete this account and will manually delete it</span>
              </span>
            </label>
          </fieldset>
        </div>

        <div className="modal-section">
          {notesMode === 'add' ? (
            <div className="notes-add-row">
              <span className="label" style={{ margin: 0 }}>
                Notes
              </span>
              <button type="button" className="btn btn-primary" onClick={() => setNotesMode('edit')}>
                Add notes <EditIcon size={14} />
              </button>
            </div>
          ) : (
            <>
              <label className="label" htmlFor="notes-textarea">
                Notes
              </label>
              <textarea
                id="notes-textarea"
                className="notes-textarea"
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                placeholder="Add any details you'd like to remember about this account…"
              />
            </>
          )}
        </div>

        <hr />
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={requestClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" disabled={!dirty} onClick={handleSave}>
            Save
          </button>
        </div>

        {showDiscardConfirm && (
          <div className="confirm-overlay" role="alertdialog" aria-modal="true" aria-label="Discard changes?">
            <p>Are you sure you want to discard your changes?</p>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDiscardConfirm(false)}
                autoFocus
              >
                Keep editing
              </button>
              <button type="button" className="btn btn-primary" onClick={discardAndClose}>
                Discard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
