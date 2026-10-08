import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../state/store';
import { fetchTestQuestions, submitTest, type TestQuestion } from '../api';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function KnowledgeTest() {
  const { dispatch, pushToast, refreshScore } = useStore();
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchTestQuestions()
      .then((qs) => {
        setQuestions(qs);
        setAnswers(Array(qs.length).fill(''));
      })
      .catch(() => setLoadError('Could not load the knowledge test.'));
  }, []);

  const hasAnswers = answers.some((a) => a.length > 0);
  const current = questions[index];
  const isLast = index === questions.length - 1;
  const canSubmit = answers.length === questions.length && answers.every(Boolean);

  function leaveTest() {
    dispatch({ type: 'SHOW_DASHBOARD' });
  }

  function requestEnd() {
    if (hasAnswers) setShowDiscard(true);
    else leaveTest();
  }

  async function handleSubmit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const result = await submitTest(answers);
      if (result.privacyScore) {
        dispatch({ type: 'SET_PRIVACY_SCORE', score: result.privacyScore });
      } else {
        await refreshScore();
      }
      pushToast('Knowledge test saved', `You scored ${result.score} out of ${result.total}.`);
      leaveTest();
    } catch {
      pushToast('Could not save test', 'Please try submitting again.');
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (!showDiscard) return undefined;
    const modalEl = modalRef.current;
    const focusables = modalEl?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    focusables?.[0]?.focus();

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setShowDiscard(false);
      }
    }
    document.addEventListener('keydown', handleKey, true);
    return () => document.removeEventListener('keydown', handleKey, true);
  }, [showDiscard]);

  return (
    <main id="main-content" className="knowledge-test">
      <div className="knowledge-test__header">
        <h1 className="section-title">Test Your Privacy Knowledge</h1>
        <button type="button" className="btn btn-secondary" onClick={requestEnd}>
          End Test
        </button>
      </div>

      {loadError && <p className="knowledge-test__status">{loadError}</p>}
      {!loadError && questions.length === 0 && <p className="knowledge-test__status">Loading questions…</p>}

      {current && (
        <form
          className="knowledge-test__card"
          onSubmit={(e) => {
            e.preventDefault();
            if (isLast) void handleSubmit();
            else setIndex((i) => i + 1);
          }}
        >
          <p className="knowledge-test__progress">
            Question {index + 1} of {questions.length}
          </p>
          <fieldset>
            <legend>{current.prompt}</legend>
            {current.options.map((opt) => (
              <label key={opt.value} className="radio-field">
                <input
                  type="radio"
                  name={current.id}
                  value={opt.value}
                  checked={answers[index] === opt.value}
                  onChange={() => {
                    setAnswers((prev) => {
                      const next = [...prev];
                      next[index] = opt.value;
                      return next;
                    });
                  }}
                />
                <span className="radio-field__text">
                  <strong>
                    {opt.value}. {opt.label}
                  </strong>
                </span>
              </label>
            ))}
          </fieldset>

          <div className="knowledge-test__nav">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={index === 0}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
            >
              Back
            </button>
            {isLast ? (
              <button type="submit" className="btn btn-primary" disabled={!canSubmit || submitting}>
                {submitting ? 'Submitting…' : 'Submit'}
              </button>
            ) : (
              <button type="submit" className="btn btn-primary" disabled={!answers[index]}>
                Next
              </button>
            )}
          </div>
        </form>
      )}

      {showDiscard && (
        <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowDiscard(false)}>
          <div
            className="modal modal-wrapper"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="end-test-title"
            ref={modalRef}
          >
            <h2 id="end-test-title">End this test?</h2>
            <p>Are you sure? Your test answers for this session will be discarded.</p>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowDiscard(false)} autoFocus>
                Keep taking the test
              </button>
              <button type="button" className="btn btn-primary" onClick={leaveTest}>
                Discard and exit
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
