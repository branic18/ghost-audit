import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type {
  BreachRecord,
  DashboardView,
  PersistedDashboard,
  PrivacyScore,
  SortColumn,
  SortDirection,
  ToastMessage,
} from '../types';
import { fetchPrivacyScore, fetchSessionState, saveSessionState } from '../api';

type View = DashboardView;
type Theme = 'light' | 'dark';

interface SortState {
  column: SortColumn | null;
  direction: SortDirection;
}

interface SettingsTarget {
  email: string;
  recordId: string;
}

export interface State {
  workspaces: Record<string, BreachRecord[]>;
  emailOrder: string[];
  currentEmail: string | null;
  view: View;
  theme: Theme;
  toasts: ToastMessage[];
  actionSort: SortState;
  noticeSort: SortState;
  settingsTarget: SettingsTarget | null;
  privacyScore: PrivacyScore;
}

type Action =
  | { type: 'SEARCH_START'; email: string }
  | { type: 'SEARCH_DONE'; email: string; records: BreachRecord[] }
  | { type: 'SELECT_EMAIL'; email: string }
  | { type: 'SHOW_ARCHIVES' }
  | { type: 'SHOW_DASHBOARD' }
  | { type: 'SHOW_KNOWLEDGE_TEST' }
  | { type: 'SET_PRIVACY_SCORE'; score: PrivacyScore }
  | { type: 'HYDRATE'; dashboard: PersistedDashboard; score: PrivacyScore }
  | { type: 'START_NEW_SCAN' }
  | { type: 'TOGGLE_ACCORDION'; email: string; recordId: string }
  | {
      type: 'SET_PRESELECT';
      email: string;
      recordId: string;
      selection: 'PreSelectSecure' | 'PreSelectDelete';
    }
  | { type: 'CONFIRM_SELECTION'; email: string; recordId: string }
  | {
      type: 'TOGGLE_CHECKLIST_ITEM';
      email: string;
      recordId: string;
      list: 'secureChecklist' | 'deleteChecklist';
      itemId: string;
    }
  | { type: 'COMPLETE_REMEDIATION'; email: string; recordId: string }
  | { type: 'REOPEN_REPORT'; email: string; recordId: string }
  | { type: 'MOVE_NOTICE_TO_ACTION'; email: string; recordId: string }
  | { type: 'OPEN_SETTINGS'; email: string; recordId: string }
  | { type: 'CLOSE_SETTINGS' }
  | {
      type: 'SAVE_SETTINGS';
      email: string;
      recordId: string;
      selection: 'Secure' | 'Delete' | null;
      notesText: string;
    }
  | { type: 'SET_THEME'; theme: Theme }
  | { type: 'ADD_TOAST'; toast: ToastMessage }
  | { type: 'REMOVE_TOAST'; id: string }
  | {
      type: 'SET_SORT';
      table: 'action' | 'notice';
      column: SortColumn;
    };

function updateRecord(
  workspaces: State['workspaces'],
  email: string,
  recordId: string,
  fn: (r: BreachRecord) => BreachRecord,
): State['workspaces'] {
  const list = workspaces[email];
  if (!list) return workspaces;
  return {
    ...workspaces,
    [email]: list.map((r) => (r.id === recordId ? fn(r) : r)),
  };
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SEARCH_START': {
      return { ...state, view: 'loading', currentEmail: action.email };
    }
    case 'SEARCH_DONE': {
      const exists = state.workspaces[action.email];
      const records = exists ?? action.records;
      const emailOrder = state.emailOrder.includes(action.email)
        ? state.emailOrder
        : [...state.emailOrder, action.email];
      return {
        ...state,
        workspaces: { ...state.workspaces, [action.email]: records },
        emailOrder,
        currentEmail: action.email,
        view: 'results',
      };
    }
    case 'SELECT_EMAIL': {
      return { ...state, currentEmail: action.email, view: 'results' };
    }
    case 'SHOW_ARCHIVES':
      return { ...state, view: 'archives' };
    case 'SHOW_DASHBOARD':
      return {
        ...state,
        view: state.currentEmail ? 'results' : 'empty',
      };
    case 'SHOW_KNOWLEDGE_TEST':
      return { ...state, view: 'knowledge-test' };
    case 'SET_PRIVACY_SCORE':
      return { ...state, privacyScore: action.score };
    case 'HYDRATE': {
      const view =
        action.dashboard.view === 'knowledge-test'
          ? action.dashboard.currentEmail
            ? 'results'
            : 'empty'
          : action.dashboard.view;
      return {
        ...state,
        workspaces: action.dashboard.workspaces ?? {},
        emailOrder: action.dashboard.emailOrder ?? [],
        currentEmail: action.dashboard.currentEmail ?? null,
        view,
        theme: action.dashboard.theme === 'light' ? 'light' : 'dark',
        actionSort: action.dashboard.actionSort ?? state.actionSort,
        noticeSort: action.dashboard.noticeSort ?? state.noticeSort,
        privacyScore: action.score,
      };
    }
    case 'START_NEW_SCAN':
      return { ...state, view: 'empty', currentEmail: null };
    case 'TOGGLE_ACCORDION': {
      return {
        ...state,
        workspaces: updateRecord(state.workspaces, action.email, action.recordId, (r) => ({
          ...r,
          isOpen: !r.isOpen,
        })),
      };
    }
    case 'SET_PRESELECT': {
      return {
        ...state,
        workspaces: updateRecord(state.workspaces, action.email, action.recordId, (r) => ({
          ...r,
          selection: action.selection,
        })),
      };
    }
    case 'CONFIRM_SELECTION': {
      return {
        ...state,
        workspaces: updateRecord(state.workspaces, action.email, action.recordId, (r) => ({
          ...r,
          selection: r.selection === 'PreSelectDelete' ? 'Delete' : 'Secure',
        })),
      };
    }
    case 'TOGGLE_CHECKLIST_ITEM': {
      return {
        ...state,
        workspaces: updateRecord(state.workspaces, action.email, action.recordId, (r) => ({
          ...r,
          [action.list]: r[action.list].map((item) =>
            item.id === action.itemId ? { ...item, checked: !item.checked } : item,
          ),
        })),
      };
    }
    case 'COMPLETE_REMEDIATION': {
      return {
        ...state,
        workspaces: updateRecord(state.workspaces, action.email, action.recordId, (r) => ({
          ...r,
          type: 'archive',
          isOpen: false,
          archivedAt: new Date().toISOString(),
          actionTaken: r.selection === 'Delete' ? 'deleted' : 'secured',
          notesMode: r.notesEnabled ? 'readonly' : r.notesMode,
        })),
      };
    }
    case 'REOPEN_REPORT': {
      return {
        ...state,
        workspaces: updateRecord(state.workspaces, action.email, action.recordId, (r) => ({
          ...r,
          type: 'action',
          notesMode: r.notesEnabled ? 'edit' : 'add',
        })),
      };
    }
    case 'MOVE_NOTICE_TO_ACTION': {
      return {
        ...state,
        workspaces: updateRecord(state.workspaces, action.email, action.recordId, (r) => ({
          ...r,
          type: 'action',
          isOpen: true,
        })),
      };
    }
    case 'OPEN_SETTINGS':
      return {
        ...state,
        settingsTarget: { email: action.email, recordId: action.recordId },
      };
    case 'CLOSE_SETTINGS':
      return { ...state, settingsTarget: null };
    case 'SAVE_SETTINGS': {
      const next = updateRecord(state.workspaces, action.email, action.recordId, (r) => ({
        ...r,
        selection:
          action.selection === null
            ? r.selection
            : r.selection === 'Secure' || r.selection === 'Delete'
              ? action.selection
              : action.selection === 'Secure'
                ? 'PreSelectSecure'
                : 'PreSelectDelete',
        notesEnabled: action.notesText.trim().length > 0 || r.notesEnabled,
        notesText: action.notesText,
        notesMode: action.notesText.trim().length > 0 ? 'edit' : r.notesMode,
      }));
      return { ...state, workspaces: next, settingsTarget: null };
    }
    case 'SET_THEME':
      return { ...state, theme: action.theme };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.toast] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    case 'SET_SORT': {
      const key = action.table === 'action' ? 'actionSort' : 'noticeSort';
      const current = state[key];
      const direction: SortDirection =
        current.column === action.column && current.direction === 'asc' ? 'desc' : 'asc';
      return { ...state, [key]: { column: action.column, direction } };
    }
    default:
      return state;
  }
}

export const initialPrivacyScore: PrivacyScore = {
  finalScore: 50,
  knowledgeScore: 0,
  emailCheckerScore: 50,
  knowledgeRaw: 0,
  knowledgeTotal: 5,
  actionsCount: 0,
  status: 'Below Secure',
  description: 'Your digital identity is vulnerable. Take action to improve it.',
};

export const initialState: State = {
  workspaces: {},
  emailOrder: [],
  currentEmail: null,
  view: 'empty',
  theme: 'dark',
  toasts: [],
  actionSort: { column: null, direction: 'asc' },
  noticeSort: { column: null, direction: 'asc' },
  settingsTarget: null,
  privacyScore: initialPrivacyScore,
};

interface Ctx {
  state: State;
  dispatch: React.Dispatch<Action>;
  pushToast: (title: string, body: string) => void;
  refreshScore: () => Promise<void>;
  sessionReady: boolean;
}

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({
  children,
  initialStateOverride,
}: {
  children: React.ReactNode;
  /** For tests/tooling only: seed the store with a custom state. */
  initialStateOverride?: State;
}) {
  const [state, dispatch] = useReducer(reducer, initialStateOverride ?? initialState);
  const toastCounter = useRef(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  const pushToast = useCallback((title: string, body: string) => {
    toastCounter.current += 1;
    const id = `toast-${toastCounter.current}`;
    dispatch({ type: 'ADD_TOAST', toast: { id, title, body } });
  }, []);

  const persistTimer = useRef<number | null>(null);
  const hydrated = useRef(Boolean(initialStateOverride));
  const [sessionReady, setSessionReady] = useState(Boolean(initialStateOverride));

  const refreshScore = useCallback(async () => {
    try {
      const score = await fetchPrivacyScore();
      dispatch({ type: 'SET_PRIVACY_SCORE', score });
    } catch {
      /* keep last known score */
    }
  }, []);

  function snapshot(current: State): PersistedDashboard {
    const view: PersistedDashboard['view'] =
      current.view === 'loading' || current.view === 'knowledge-test'
        ? current.currentEmail
          ? 'results'
          : 'empty'
        : current.view;
    return {
      workspaces: current.workspaces,
      emailOrder: current.emailOrder,
      currentEmail: current.currentEmail,
      view,
      theme: current.theme,
      actionSort: current.actionSort,
      noticeSort: current.noticeSort,
    };
  }

  useEffect(() => {
    if (initialStateOverride) return undefined;
    let cancelled = false;
    fetchSessionState()
      .then(({ dashboard, score }) => {
        if (cancelled) return;
        if (dashboard) {
          dispatch({ type: 'HYDRATE', dashboard, score });
        }
        hydrated.current = true;
        setSessionReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        hydrated.current = true;
        setSessionReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [initialStateOverride]);

  useEffect(() => {
    if (!sessionReady) return undefined;
    if (state.view === 'loading') return undefined;
    if (persistTimer.current) window.clearTimeout(persistTimer.current);
    persistTimer.current = window.setTimeout(() => {
      saveSessionState(snapshot(stateRef.current))
        .then(({ score }) => {
          dispatch({ type: 'SET_PRIVACY_SCORE', score });
        })
        .catch(() => {
          /* keep local state if save fails */
        });
    }, 250);
    return () => {
      if (persistTimer.current) window.clearTimeout(persistTimer.current);
    };
  }, [
    state.workspaces,
    state.emailOrder,
    state.currentEmail,
    state.view,
    state.theme,
    state.actionSort,
    state.noticeSort,
    sessionReady,
  ]);

  const value = useMemo(
    () => ({ state, dispatch, pushToast, refreshScore, sessionReady }),
    [state, pushToast, refreshScore, sessionReady],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export function sortRecords(
  records: BreachRecord[],
  sort: SortState,
): BreachRecord[] {
  if (!sort.column) return records;
  const dir = sort.direction === 'asc' ? 1 : -1;
  const withProgress = (r: BreachRecord) => {
    const list = r.selection === 'Delete' ? r.deleteChecklist : r.secureChecklist;
    if (r.selection === 'None' || r.selection === 'PreSelectSecure' || r.selection === 'PreSelectDelete') return -1;
    const done = list.filter((i) => i.checked).length;
    return list.length === 0 ? 0 : done / list.length;
  };
  return [...records].sort((a, b) => {
    if (sort.column === 'breachDate') {
      return dir * a.breachDate.localeCompare(b.breachDate);
    }
    if (sort.column === 'addedDate') {
      return dir * a.addedDate.localeCompare(b.addedDate);
    }
    if (sort.column === 'checklist') {
      return dir * (withProgress(a) - withProgress(b));
    }
    return 0;
  });
}

export type { SortState };
