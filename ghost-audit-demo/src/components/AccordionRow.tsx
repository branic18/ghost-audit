import React, { useId } from 'react';
import type { BreachRecord } from '../types';
import { useStore } from '../state/store';
import AccordionPanel from './AccordionPanel';
import Checklist from './Checklist';
import { ShoppingBagIcon, DollarSignIcon, CheckCircleIcon, SettingsFilledIcon } from './icons';

interface Props {
  record: BreachRecord;
  email: string;
}

function progressFor(record: BreachRecord) {
  const list = record.selection === 'Delete' ? record.deleteChecklist : record.secureChecklist;
  const done = list.length ? list.filter((i) => i.checked).length : 0;
  return { list, done, total: list.length };
}

export default function AccordionRow({ record, email }: Props) {
  const { state, dispatch, pushToast } = useStore();
  const panelId = useId();
  const isArchive = record.type === 'archive';
  const finalized = record.selection === 'Secure' || record.selection === 'Delete';
  const { list, done, total } = progressFor(record);
  const pct = total ? Math.round((done / total) * 100) : 0;
  const allDone = total > 0 && done === total;

  function toggleOpen() {
    dispatch({ type: 'TOGGLE_ACCORDION', email, recordId: record.id });
  }

  function handlePreSelect(selection: 'PreSelectSecure' | 'PreSelectDelete') {
    dispatch({ type: 'SET_PRESELECT', email, recordId: record.id, selection });
  }

  function handleConfirmSelection() {
    dispatch({ type: 'CONFIRM_SELECTION', email, recordId: record.id });
  }

  function handleToggleItem(itemId: string) {
    dispatch({
      type: 'TOGGLE_CHECKLIST_ITEM',
      email,
      recordId: record.id,
      list: record.selection === 'Delete' ? 'deleteChecklist' : 'secureChecklist',
      itemId,
    });
  }

  function handleComplete() {
    dispatch({ type: 'COMPLETE_REMEDIATION', email, recordId: record.id });
    pushToast(
      'Action completed',
      `You can find the record of this database action for ${record.domain} in Archives.`,
    );
  }

  function handleReopen() {
    dispatch({ type: 'REOPEN_REPORT', email, recordId: record.id });
  }

  const radioGroupName = `remediation-goal-${record.id}`;
  const isPreSecure = record.selection === 'PreSelectSecure' || record.selection === 'Secure';
  const isPreDelete = record.selection === 'PreSelectDelete' || record.selection === 'Delete';
  const canSave = record.selection === 'PreSelectSecure' || record.selection === 'PreSelectDelete';

  return (
    <div className="record-row">
      <button
        type="button"
        className="record-row__grid"
        aria-expanded={record.isOpen}
        aria-controls={panelId}
        onClick={toggleOpen}
      >
        <span className="record-cell domain">
          <span className="record-cell__icon">
            {isArchive ? (
              <CheckCircleIcon size={16} />
            ) : record.selection === 'None' ? (
              <ShoppingBagIcon size={16} />
            ) : (
              <DollarSignIcon size={16} />
            )}
          </span>
          {record.domain}
        </span>
        <span className="record-cell">{record.breachDate}</span>
        <span className="record-cell">{record.addedDate}</span>
        <span className="record-cell">{record.dataTypes.join(', ')}</span>
        <span className="record-cell record-cell--checklist">
          {isArchive ? (
            <span className="archived-badge">
              <CheckCircleIcon size={16} /> Archived
            </span>
          ) : finalized ? (
            <span className="mini-progress">
              <span className="progress-track" aria-hidden="true">
                <span style={{ width: `${pct}%` }} />
              </span>
              <span className="count">
                {total - done} item{total - done === 1 ? '' : 's'} left
              </span>
            </span>
          ) : (
            <span className="select-action-btn">Select account action</span>
          )}
        </span>
      </button>

      <AccordionPanel open={record.isOpen} id={panelId} className="accordion-panel accordion-panel--action">
          <div className="accordion-panel__col">
            <h3>{record.domain.replace(/\.com$/, '')}</h3>
            <p className="breach-meta">
              Breach Date: {record.breachDate}
              <br />
              Added Date: {record.addedDate}
            </p>
            <p className="breach-meta">{record.accountsAffected.toLocaleString()} user accounts affected</p>
            {record.verified && (
              <p className="breach-verified">
                <CheckCircleIcon size={15} /> This is a verified data breach
              </p>
            )}
          </div>

          <div className="accordion-panel__col">
            <p className="breach-desc">{record.summary}</p>
          </div>

          <div className="accordion-panel__col remediation">
            {isArchive ? (
              <>
                <h4>Remediation</h4>
                <p className="remediation__prompt">
                  {record.actionTaken === 'deleted'
                    ? 'Secure your account first, then delete it. This helps prevent further unauthorized access, gives you a chance to review any suspicious activity and save anything important before removing the account.'
                    : 'Your email and password were exposed. Change your password immediately and anywhere it was reused to reduce the risk of account compromise and phishing.'}
                </p>
                <Checklist items={list} readOnly legend={`Completed remediation checklist for ${record.domain}`} />
                <button type="button" className="btn btn-secondary" onClick={handleReopen}>
                  Reopen Report
                </button>
              </>
            ) : finalized ? (
              <>
                <h4>Remediation</h4>
                <p className="remediation__prompt">
                  {record.selection === 'Delete'
                    ? 'Secure your account first, then delete it. This helps prevent further unauthorized access, gives you a chance to review any suspicious activity and save anything important before removing the account.'
                    : 'Your email and password were exposed. Change your password immediately and anywhere it was reused to reduce the risk of account compromise and phishing.'}
                </p>
                <div className="remediation__progress">
                  <span className="progress-track" aria-hidden="true">
                    <span style={{ width: `${pct}%` }} />
                  </span>
                  <span className="visually-hidden">{pct}% of remediation steps complete</span>
                  <span aria-hidden="true">
                    {done}/{total} complete
                  </span>
                </div>
                <Checklist
                  items={list}
                  onToggle={handleToggleItem}
                  legend={`Remediation checklist for ${record.domain}`}
                />
                {allDone && (
                  <button type="button" className="btn btn-success" onClick={handleComplete}>
                    {record.selection === 'Delete'
                      ? 'Mark this account as secured and deleted'
                      : 'Mark this account as secure'}
                  </button>
                )}
              </>
            ) : (
              <>
                <h4>Remediation</h4>
                <p className="remediation__prompt">
                  Please select your goal for this data breach. This will determine your remediation
                  steps.
                </p>
                <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                  <legend className="visually-hidden">Choose a remediation goal for {record.domain}</legend>
                  <label className="radio-field">
                    <input
                      type="radio"
                      name={radioGroupName}
                      checked={isPreSecure}
                      disabled={finalized}
                      onChange={() => handlePreSelect('PreSelectSecure')}
                    />
                    <span className="radio-field__text">
                      <strong>Secure account</strong>
                      <span>You're keeping this account and want to make it secure</span>
                    </span>
                  </label>
                  <label className="radio-field">
                    <input
                      type="radio"
                      name={radioGroupName}
                      checked={isPreDelete}
                      disabled={finalized}
                      onChange={() => handlePreSelect('PreSelectDelete')}
                    />
                    <span className="radio-field__text">
                      <strong>Delete account</strong>
                      <span>You want to delete this account and will manually delete it</span>
                    </span>
                  </label>
                </fieldset>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!canSave}
                  onClick={handleConfirmSelection}
                  style={{ marginTop: 12 }}
                >
                  Save account action
                </button>
              </>
            )}
          </div>

          {!isArchive && finalized && (
            <button
              type="button"
              className="settings-trigger"
              aria-label={`Open settings for ${record.domain}`}
              onClick={() => dispatch({ type: 'OPEN_SETTINGS', email, recordId: record.id })}
            >
              <SettingsFilledIcon size={20} />
            </button>
          )}

          {record.notesEnabled && record.notesText.trim() && (
            <div className="notes-block">
              <h4>My Notes:</h4>
              <p>{record.notesText}</p>
            </div>
          )}
      </AccordionPanel>
    </div>
  );
}
