import React from 'react';
import { useStore } from '../state/store';
import RecordTable from './RecordTable';

export default function ArchivesView() {
  const { state } = useStore();

  const groups = state.emailOrder
    .map((email) => ({
      email,
      records: (state.workspaces[email] ?? []).filter((r) => r.type === 'archive'),
    }))
    .filter((g) => g.records.length > 0);

  if (groups.length === 0) {
    return (
      <div className="archives-empty">
        <p>
          No archived accounts yet. Complete a remediation from your action list and it will
          show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="tables-wrap">
      {groups.map((g) => (
        <RecordTable
          key={g.email}
          kind="action"
          title={`Archived — ${g.email}`}
          records={g.records}
          email={g.email}
          sort={state.actionSort}
        />
      ))}
    </div>
  );
}
