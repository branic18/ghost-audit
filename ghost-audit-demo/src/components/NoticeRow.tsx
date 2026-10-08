import React, { useId } from 'react';
import type { BreachRecord } from '../types';
import { useStore } from '../state/store';
import AccordionPanel from './AccordionPanel';
import { ShoppingBagIcon, CheckCircleIcon } from './icons';

interface Props {
  record: BreachRecord;
  email: string;
}

export default function NoticeRow({ record, email }: Props) {
  const { dispatch } = useStore();
  const panelId = useId();

  function toggleOpen() {
    dispatch({ type: 'TOGGLE_ACCORDION', email, recordId: record.id });
  }

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
            <ShoppingBagIcon size={16} />
          </span>
          {record.domain}
        </span>
        <span className="record-cell">{record.breachDate}</span>
        <span className="record-cell">{record.addedDate}</span>
        <span className="record-cell">{record.dataTypes.join(', ')}</span>
      </button>

      <AccordionPanel open={record.isOpen} id={panelId} className="accordion-panel accordion-panel--notice">
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
          <div className="accordion-panel__col monitoring-block">
            <p className="breach-desc">{record.summary}</p>
          </div>
          <div className="accordion-panel__col remediation">
            <h4>Continuous Monitoring</h4>
            <p className="remediation__prompt">{record.monitoringNote}</p>
            <button
              type="button"
              className="btn btn-tertiary"
              onClick={() => dispatch({ type: 'MOVE_NOTICE_TO_ACTION', email, recordId: record.id })}
            >
              Move to Action List
            </button>
          </div>
      </AccordionPanel>
    </div>
  );
}
