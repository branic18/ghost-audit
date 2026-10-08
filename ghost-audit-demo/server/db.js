import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DATA_DIR || path.join(__dirname, '../data');
fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'ghost-audit.sqlite');
const db = new DatabaseSync(dbPath);

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    dashboard_json TEXT,
    test_score INTEGER,
    test_answers TEXT,
    test_date TEXT
  );
`);

const selectSession = db.prepare('SELECT * FROM sessions WHERE id = ?');
const insertSession = db.prepare(`
  INSERT INTO sessions (id, created_at, updated_at, dashboard_json, test_score, test_answers, test_date)
  VALUES (?, ?, ?, NULL, NULL, NULL, NULL)
`);
const updateDashboard = db.prepare(`
  UPDATE sessions SET dashboard_json = ?, updated_at = ? WHERE id = ?
`);
const updateTest = db.prepare(`
  UPDATE sessions SET test_score = ?, test_answers = ?, test_date = ?, updated_at = ? WHERE id = ?
`);

export function getOrCreateSession(id) {
  let row = selectSession.get(id);
  if (!row) {
    const now = new Date().toISOString();
    insertSession.run(id, now, now);
    row = selectSession.get(id);
  }
  return row;
}

export function saveDashboard(id, dashboard) {
  getOrCreateSession(id);
  updateDashboard.run(JSON.stringify(dashboard), new Date().toISOString(), id);
}

export function saveTest(id, score, answers) {
  getOrCreateSession(id);
  updateTest.run(
    score,
    JSON.stringify(answers),
    new Date().toISOString(),
    new Date().toISOString(),
    id,
  );
}

export function parseDashboard(row) {
  if (!row?.dashboard_json) return null;
  try {
    return JSON.parse(row.dashboard_json);
  } catch {
    return null;
  }
}

export function parseTest(row) {
  if (row?.test_score == null) return null;
  let answers = [];
  try {
    answers = row.test_answers ? JSON.parse(row.test_answers) : [];
  } catch {
    answers = [];
  }
  return {
    score: Number(row.test_score) || 0,
    answers,
    dateTaken: row.test_date,
  };
}

export { dbPath };
