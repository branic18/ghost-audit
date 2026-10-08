# Ghost Audit — Product Requirements Document

## Overview

Ghost Audit is a data-breach monitoring and remediation dashboard. A user enters an email address, the tool scans for known data breaches tied to that address, and surfaces the results as a set of accounts that need action — with guided workflows to secure or delete each one, track remediation progress, and keep a record of what's been resolved.

## Problem Statement

People don't know which of their online accounts have been exposed in a data breach, and even when they find out, they have no structured way to decide what to do about it or track whether they've followed through. Ghost Audit turns "was I breached?" into a manageable checklist.

## Goals

- Let a user check whether an email address appears in known data breaches.
- Give each exposed account a clear next step: secure it or delete it.
- Provide step-by-step remediation checklists so users actually complete the fix, not just see the warning.
- Track a user's overall "privacy posture" as a simple score they can improve over time.
- Keep a searchable history across multiple scanned emails and a permanent archive of resolved items.

## Non-Goals

- Ghost Audit does not perform the breach scan itself (in this prototype, results are simulated) — a production version would integrate a real breach-data API.
- No account creation, authentication, or multi-user support in this version — it's a single-session dashboard.
- No automated remediation (e.g., auto-deleting accounts) — all actions are manual steps the user confirms themselves.

## Key Features

### 1. Privacy Posture Banner
A collapsible summary banner at the top of the dashboard shows the user's overall privacy posture as a percentage score, along with a one-line assessment ("Good Start, Improve Protection"). When expanded, it also shows a count of unresolved breach accounts and a "Knowledge Test" score with a retest option, encouraging ongoing engagement rather than a one-time check.

### 2. Email Scan
A search bar lets the user enter an email address and scan the web for breaches tied to it. While scanning, a loading state shows progress. Once complete, results are grouped into two tables:
- **Action Required** — accounts that need the user to decide what to do.
- **Notices** — lower-priority or informational breach records that haven't been escalated to action yet.

Each previously scanned email is saved and selectable from a dropdown, so the user can switch between multiple identities they've checked without re-running the scan.

### 3. Breach Record Detail
Each record in a table is an expandable row showing the breached domain, breach date, date added, data types exposed, number of accounts affected, and a verification status, plus a summary of the incident. Records can be sorted by breach date, date added, or remediation progress.

### 4. Remediation Workflow
For each breach record, the user chooses a goal — **Secure** or **Delete** the account — which unlocks a corresponding checklist of remediation steps (e.g., change password, enable 2FA, or confirm manual deletion). Progress through the checklist is tracked per item. Once the user confirms the action is complete, the record moves to the Archive with a timestamp and a record of whether it was secured or deleted.

### 5. Notes & Settings
Each record has a settings panel where the user can revise their Secure/Delete goal and add free-text notes for their own reference (e.g., context on why they made a decision). Changes are only saved when explicitly confirmed, with a discard-changes confirmation if the user tries to close without saving.

### 6. Notices → Action Promotion
Lower-priority "Notice" records can be promoted into the Action Required table when the user decides they're worth acting on, moving them into the full remediation workflow.

### 7. Archive
Completed remediations are moved out of the active tables into a per-email Archive view, preserving what was done and when, so the user has a durable record of resolved breaches. Archived items can be reopened if the user needs to revisit them.

### 8. Account Menu & Theme
A top bar provides light/dark theme switching and displays the user's current IP address with an informational popover, reinforcing the privacy/security framing of the product.

### 9. Notifications
Toast messages confirm actions the user takes (e.g., saving notes), giving lightweight feedback without interrupting the workflow.

## User Flow (Happy Path)

1. User lands on the dashboard and enters an email in the search bar.
2. Ghost Audit scans and returns a list of breaches, split into Action Required and Notices.
3. User expands a breach record, reviews the details, and chooses Secure or Delete.
4. User works through the resulting checklist and marks it complete.
5. The record moves to Archive with a timestamp; the privacy posture score updates to reflect progress.
6. User can scan additional emails, switch between them via the dropdown, or review the Archive at any time.

## Accessibility

The interface is built with keyboard navigation, focus trapping in modals, ARIA roles for menus and dialogs, and `prefers-reduced-motion` support, so the audit workflow is usable without a mouse and doesn't rely on animation to convey state.

## Success Metrics (Suggested)

- % of flagged accounts moved from Action Required to Archive (remediation completion rate).
- Average time from scan to first action taken.
- Return usage — number of users who scan a second email or revisit an archived record.
- Improvement in privacy posture score over time per user.