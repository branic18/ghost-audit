import React, { useState } from 'react';
import { useStore } from '../state/store';
import { ChevronDownIcon } from './icons';

export default function Banner() {
  const { state, dispatch } = useStore();
  const [expanded, setExpanded] = useState(true);
  const score = state.privacyScore;
  const unresolved = score.actionsCount;
  const greetingName = 'Jane';

  return (
    <section className={`banner${expanded ? ' is-expanded' : ''}`} aria-label="Privacy posture summary">
      <div className="banner__greeting">
        <p className="banner__greeting-text">
          Good Morning {greetingName}, as of now your privacy posture is {score.finalScore}%
        </p>
        {expanded && <p className="banner__pct-note">{score.description}</p>}
      </div>

      {expanded && (
        <div className="banner__summary">
          <p>
            Data Breach Monitor - {unresolved} unresolved account{unresolved === 1 ? '' : 's'}
          </p>
          <div className="banner__knowledge">
            <p>
              Knowledge Test - {score.knowledgeRaw}/{score.knowledgeTotal}
            </p>
            <button
              type="button"
              className="pill-btn"
              onClick={() => dispatch({ type: 'SHOW_KNOWLEDGE_TEST' })}
            >
              {score.knowledgeRaw > 0 ? 'Retest →' : 'Take test →'}
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        className={`banner__collapse-toggle${expanded ? ' is-expanded' : ''}`}
        aria-expanded={expanded}
        aria-label={expanded ? 'Collapse privacy posture summary' : 'Expand privacy posture summary'}
        onClick={() => setExpanded((v) => !v)}
      >
        <ChevronDownIcon size={16} />
      </button>
    </section>
  );
}
