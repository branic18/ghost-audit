import React, { useId, useState } from 'react';
import type { BreachRecord, SortColumn } from '../types';
import { useStore, sortRecords, type SortState } from '../state/store';
import AccordionRow from './AccordionRow';
import NoticeRow from './NoticeRow';
import { ArrowUpIcon, ArrowDownIcon, SortNeutralIcon, ChevronDownIcon } from './icons';

interface Props {
  kind: 'action' | 'notice';
  title: string;
  records: BreachRecord[];
  email: string;
  sort: SortState;
}

function SortableHeader({
  label,
  column,
  sort,
  onSort,
}: {
  label: string;
  column: SortColumn;
  sort: SortState;
  onSort: (c: SortColumn) => void;
}) {
  const active = sort.column === column;
  const ariaSort = active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none';
  return (
    <div className="col-header" role="columnheader" aria-sort={ariaSort as React.AriaAttributes['aria-sort']}>
      <button type="button" onClick={() => onSort(column)}>
        {label}
        <span className="sort-arrow">
          {active ? (
            sort.direction === 'asc' ? (
              <ArrowUpIcon size={17} />
            ) : (
              <ArrowDownIcon size={17} />
            )
          ) : (
            <SortNeutralIcon size={17} />
          )}
        </span>
      </button>
    </div>
  );
}

export default function RecordTable({ kind, title, records, email, sort }: Props) {
  const { dispatch } = useStore();
  const [collapsed, setCollapsed] = useState(false);
  const bodyId = useId();

  const sorted = sortRecords(records, sort);

  function handleSort(column: SortColumn) {
    dispatch({ type: 'SET_SORT', table: kind, column });
  }

  if (records.length === 0) return null;

  return (
    <section className={`record-table record-table--${kind}`} aria-label={title}>
      <button
        type="button"
        className="record-table__title"
        aria-expanded={!collapsed}
        aria-controls={bodyId}
        onClick={() => setCollapsed((v) => !v)}
      >
        <span className="record-table__title-left">
          <strong>{title}</strong>
          <span className="record-table__count">
            {records.length} account{records.length === 1 ? '' : 's'}
          </span>
        </span>
        <span className={`chevron${collapsed ? ' collapsed' : ''}`}>
          <ChevronDownIcon size={24} />
        </span>
      </button>

      <div id={bodyId} hidden={collapsed}>
        <div className="record-table__head" role="row">
          <div role="columnheader">Domain</div>
          <SortableHeader label="Breach Date" column="breachDate" sort={sort} onSort={handleSort} />
          <SortableHeader label="Added Date" column="addedDate" sort={sort} onSort={handleSort} />
          <div role="columnheader">Data Type</div>
          {kind === 'action' && (
            <SortableHeader label="Progress" column="checklist" sort={sort} onSort={handleSort} />
          )}
        </div>
        <div role="rowgroup">
          {sorted.map((record) =>
            kind === 'action' ? (
              <AccordionRow key={record.id} record={record} email={email} />
            ) : (
              <NoticeRow key={record.id} record={record} email={email} />
            ),
          )}
        </div>
      </div>
    </section>
  );
}
