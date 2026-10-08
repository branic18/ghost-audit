import React from 'react';
import { useStore } from '../state/store';
import RecordTable from './RecordTable';

export default function ResultsView() {
  const { state } = useStore();
  const email = state.currentEmail;
  if (!email) return null;
  const records = state.workspaces[email] ?? [];
  const actionRecords = records.filter((r) => r.type === 'action');
  const noticeRecords = records.filter((r) => r.type === 'notice');

  if (actionRecords.length === 0 && noticeRecords.length === 0) {
    return (
      <div className="state-panel">
        <p>No results to show for {email}. Try scanning another email address.</p>
      </div>
    );
  }

  return (
    <div className="tables-wrap">
      <RecordTable
        kind="action"
        title="Action Required"
        records={actionRecords}
        email={email}
        sort={state.actionSort}
      />
      <RecordTable
        kind="notice"
        title="Notices"
        records={noticeRecords}
        email={email}
        sort={state.noticeSort}
      />
    </div>
  );
}
