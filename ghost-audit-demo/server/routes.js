import { randomUUID } from 'node:crypto';
import express from 'express';
import { getOrCreateSession, parseDashboard, parseTest, saveDashboard, saveTest } from './db.js';

const router = express.Router();

const COOKIE_NAME = 'ga_sid';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export const DEMO_EMAILS = [
  'jane.demo@ghostaudit.test',
  'alex.demo@ghostaudit.test',
  'sam.demo@ghostaudit.test',
];

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of String(header).split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    out[key] = decodeURIComponent(value);
  }
  return out;
}

function setSessionCookie(res, id) {
  const secure = process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production';
  const pieces = [
    `${COOKIE_NAME}=${encodeURIComponent(id)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${COOKIE_MAX_AGE}`,
  ];
  if (secure) pieces.push('Secure');
  res.append('Set-Cookie', pieces.join('; '));
}

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return String(forwarded).split(',')[0].trim();
  return String(req.socket.remoteAddress || '')
    .replace('::ffff:', '')
    .replace(/^::1$/, '127.0.0.1');
}

function isLocalIp(ip) {
  return !ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.');
}

router.use((req, res, next) => {
  const existing = parseCookies(req.headers.cookie)[COOKIE_NAME];
  const id = existing && existing.length >= 8 ? existing : randomUUID();
  getOrCreateSession(id);
  req.sessionId = id;
  setSessionCookie(res, id);
  next();
});

const EMAIL_ONLY_NOTE =
  'Only your email address exposed, but be more alert for phishing/spam; consider monitoring the address.';

/** Mock database: 15 real historical breaches (HIBP-style). */
const BREACHES = [
  {
    id: 'adobe-2013',
    name: 'Adobe',
    domain: 'Adobe.com',
    breachDate: '2013-10-04',
    addedDate: '2013-12-04',
    dataTypes: ['Email', 'Password'],
    pwnCount: 152445165,
    verified: true,
    description:
      'In October 2013, 153 million Adobe accounts were breached with each containing an internal ID, username, email, encrypted password and a password hint in plain text. The password cryptography was poorly done and many were quickly resolved back to plain text.',
    severity: 'action',
    monitoringNote: '',
  },
  {
    id: 'linkedin-2012',
    name: 'LinkedIn',
    domain: 'LinkedIn.com',
    breachDate: '2012-05-05',
    addedDate: '2016-05-18',
    dataTypes: ['Email', 'Password'],
    pwnCount: 164611595,
    verified: true,
    description:
      'In May 2012, LinkedIn suffered a data breach that exposed the SHA-1 hashed passwords of nearly all its users. The full scale was not public until 2016, when email addresses and unsalted password hashes for over 164 million accounts appeared for sale.',
    severity: 'action',
    monitoringNote: '',
  },
  {
    id: 'dropbox-2012',
    name: 'Dropbox',
    domain: 'Dropbox.com',
    breachDate: '2012-07-01',
    addedDate: '2016-08-31',
    dataTypes: ['Email', 'Password'],
    pwnCount: 68648009,
    verified: true,
    description:
      'A 2012 Dropbox breach, disclosed publicly in 2016, exposed the email addresses and salted password hashes of over 68 million accounts. The breach was traced back to an employee password reused from a previously breached site.',
    severity: 'action',
    monitoringNote: '',
  },
  {
    id: 'equifax-2017',
    name: 'Equifax',
    domain: 'Equifax.com',
    breachDate: '2017-07-29',
    addedDate: '2017-09-07',
    dataTypes: ['Email', 'Password', 'SSN', 'Name'],
    pwnCount: 147900000,
    verified: true,
    description:
      'In 2017 Equifax disclosed a breach affecting about 148 million people. Attackers exploited an unpatched Apache Struts vulnerability and obtained names, Social Security numbers, birth dates, addresses, and in some cases driver license numbers.',
    severity: 'action',
    monitoringNote: '',
  },
  {
    id: 'marriott-2014',
    name: 'Marriott / Starwood',
    domain: 'Marriott.com',
    breachDate: '2014-01-01',
    addedDate: '2018-11-30',
    dataTypes: ['Email', 'Password', 'Name', 'Passport'],
    pwnCount: 383000000,
    verified: true,
    description:
      'Marriott disclosed in 2018 that the Starwood guest reservation database had been compromised since 2014, exposing names, emails, phone numbers, passport numbers, and encrypted payment card data for hundreds of millions of guests.',
    severity: 'action',
    monitoringNote: '',
  },
  {
    id: 'myspace-2008',
    name: 'MySpace',
    domain: 'MySpace.com',
    breachDate: '2008-07-01',
    addedDate: '2016-05-31',
    dataTypes: ['Email'],
    pwnCount: 359420698,
    verified: true,
    description:
      'Believed to have occurred in 2008, the MySpace breach was revealed in 2016 and exposed email addresses, usernames and weakly hashed passwords for over 359 million accounts.',
    severity: 'notice',
    monitoringNote: EMAIL_ONLY_NOTE,
  },
  {
    id: 'yahoo-2013',
    name: 'Yahoo',
    domain: 'Yahoo.com',
    breachDate: '2013-08-01',
    addedDate: '2016-12-14',
    dataTypes: ['Email'],
    pwnCount: 3000000000,
    verified: true,
    description:
      'Yahoo disclosed that a 2013 breach affected all 3 billion of its user accounts. Exposed data included names, email addresses, phone numbers and security questions.',
    severity: 'notice',
    monitoringNote: EMAIL_ONLY_NOTE,
  },
  {
    id: 'canva-2019',
    name: 'Canva',
    domain: 'Canva.com',
    breachDate: '2019-05-24',
    addedDate: '2019-05-28',
    dataTypes: ['Email'],
    pwnCount: 137272116,
    verified: true,
    description:
      'In May 2019, design platform Canva suffered a breach exposing usernames, email addresses and, for some users, city and country information. Passwords were salted and hashed with bcrypt.',
    severity: 'notice',
    monitoringNote: EMAIL_ONLY_NOTE,
  },
  {
    id: 'tumblr-2013',
    name: 'Tumblr',
    domain: 'Tumblr.com',
    breachDate: '2013-02-28',
    addedDate: '2016-05-12',
    dataTypes: ['Email'],
    pwnCount: 65469298,
    verified: true,
    description:
      'Tumblr disclosed in 2016 that a set of user credentials from 2013 had been circulating, exposing email addresses and salted SHA-1 password hashes for over 65 million accounts.',
    severity: 'notice',
    monitoringNote: EMAIL_ONLY_NOTE,
  },
  {
    id: 'disqus-2012',
    name: 'Disqus',
    domain: 'Disqus.com',
    breachDate: '2012-07-01',
    addedDate: '2017-10-06',
    dataTypes: ['Email'],
    pwnCount: 17549900,
    verified: true,
    description:
      'A 2012 Disqus database backup was exposed in 2017, containing email addresses, usernames and salted SHA-1 password hashes for more than 17.5 million subscribers.',
    severity: 'notice',
    monitoringNote: EMAIL_ONLY_NOTE,
  },
  {
    id: 'zynga-2019',
    name: 'Zynga',
    domain: 'Zynga.com',
    breachDate: '2019-09-12',
    addedDate: '2019-12-02',
    dataTypes: ['Email'],
    pwnCount: 172869660,
    verified: true,
    description:
      'Game developer Zynga (Words With Friends) was breached in September 2019, exposing email addresses, login IDs, and hashed passwords for approximately 173 million accounts.',
    severity: 'notice',
    monitoringNote: EMAIL_ONLY_NOTE,
  },
  {
    id: 'evite-2013',
    name: 'Evite',
    domain: 'Evite.com',
    breachDate: '2013-08-11',
    addedDate: '2019-04-16',
    dataTypes: ['Email'],
    pwnCount: 100986480,
    verified: true,
    description:
      'Online invitation service Evite identified a breach where a 2013 data file containing email addresses, names, and in some cases dates of birth and phone numbers was found being traded in 2019.',
    severity: 'notice',
    monitoringNote: EMAIL_ONLY_NOTE,
  },
  {
    id: 'chegg-2018',
    name: 'Chegg',
    domain: 'Chegg.com',
    breachDate: '2018-04-29',
    addedDate: '2018-09-26',
    dataTypes: ['Email'],
    pwnCount: 39790132,
    verified: true,
    description:
      'Textbook rental service Chegg reported in 2018 that an unauthorized party gained access to a database containing usernames, email addresses and hashed passwords for nearly 40 million users.',
    severity: 'notice',
    monitoringNote: EMAIL_ONLY_NOTE,
  },
  {
    id: 'vk-2012',
    name: 'VK',
    domain: 'VK.com',
    breachDate: '2012-06-01',
    addedDate: '2016-06-06',
    dataTypes: ['Email'],
    pwnCount: 93338602,
    verified: true,
    description:
      'A 2012 breach of Russian social network VK (VKontakte) surfaced in 2016, exposing plain-text passwords and email addresses for over 93 million accounts.',
    severity: 'notice',
    monitoringNote: EMAIL_ONLY_NOTE,
  },
  {
    id: 'houzz-2018',
    name: 'Houzz',
    domain: 'Houzz.com',
    breachDate: '2018-12-25',
    addedDate: '2019-02-01',
    dataTypes: ['Email'],
    pwnCount: 48912908,
    verified: true,
    description:
      'Home design platform Houzz notified users of a 2018 breach exposing publicly visible profile information plus internal identifiers and, for some users, hashed passwords.',
    severity: 'notice',
    monitoringNote: EMAIL_ONLY_NOTE,
  },
];

const QUESTIONS = [
  {
    id: 'q1',
    prompt: 'What is a secure way to protect your social media account?',
    options: [
      { value: 'A', label: 'Use a strong password' },
      { value: 'B', label: 'Share your password with friends' },
      { value: 'C', label: 'Enable two-factor authentication' },
      { value: 'D', label: 'Use the same password across all accounts' },
    ],
  },
  {
    id: 'q2',
    prompt: 'What content do you allow your followers to see on your social media?',
    options: [
      { value: 'A', label: 'Personal details' },
      { value: 'B', label: 'Current location' },
      { value: 'C', label: 'None of the answers' },
      { value: 'D', label: 'Only content I create, nothing personal' },
    ],
  },
  {
    id: 'q3',
    prompt:
      'Which of these policies do you pay attention to when reading the terms of service of an app or service?',
    options: [
      { value: 'A', label: 'Policy on data-sharing with third parties' },
      { value: 'B', label: 'Policy on data security' },
      { value: 'C', label: 'Policy on data collection' },
      { value: 'D', label: 'Not Sure' },
      { value: 'E', label: 'None I proceed w/o wasting my time on legal information' },
    ],
  },
  {
    id: 'q4',
    prompt: 'Which of these is not a privacy feature on Instagram?',
    options: [
      { value: 'A', label: 'Block comments' },
      { value: 'B', label: 'Public profile' },
      { value: 'C', label: 'Stop direct messages' },
      { value: 'D', label: 'Remove a follower' },
    ],
  },
  {
    id: 'q5',
    prompt: 'Which of these is usually not kept private on social media?',
    options: [
      { value: 'A', label: 'Photos' },
      { value: 'B', label: 'Username' },
      { value: 'C', label: 'Invitations' },
      { value: 'D', label: 'Followers' },
    ],
  },
];

const CORRECT_ANSWERS = ['A', 'C', 'A', 'B', 'B'];

function hashEmail(email) {
  let hash = 0;
  for (let i = 0; i < email.length; i += 1) {
    hash = (hash * 31 + email.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function knowledgePoints(raw) {
  switch (raw) {
    case 5:
      return 50;
    case 4:
      return 40;
    case 3:
      return 30;
    case 2:
      return 20;
    case 1:
      return 10;
    default:
      return 0;
  }
}

function emailCheckerPoints(actionItemsCount) {
  if (actionItemsCount <= 0) return 50;
  if (actionItemsCount === 1) return 40;
  if (actionItemsCount === 2) return 30;
  if (actionItemsCount === 3) return 20;
  return 10;
}

function statusForScore(finalScore) {
  if (finalScore === 100) {
    return {
      status: 'Secure',
      description: 'You took the necessary actions to secure your digital identity.',
    };
  }
  if (finalScore >= 60) {
    return {
      status: 'Somewhat Secure',
      description: 'Good Start, Improve Protection',
    };
  }
  if (finalScore >= 30) {
    return {
      status: 'Below Secure',
      description: 'Your digital identity is vulnerable. Take action to improve it.',
    };
  }
  return {
    status: 'At Risk',
    description: 'Your digital identity is highly vulnerable. Immediate action is needed.',
  };
}

function actionsFromDashboard(dashboard) {
  if (!dashboard?.currentEmail || !dashboard.workspaces) return 0;
  const records = dashboard.workspaces[dashboard.currentEmail] ?? [];
  return records.filter((r) => r.type === 'action').length;
}

function computeScore(sessionRow, fallbackActions) {
  const test = parseTest(sessionRow);
  const dashboard = parseDashboard(sessionRow);
  const actionsCount =
    dashboard != null ? actionsFromDashboard(dashboard) : Number.isFinite(fallbackActions) ? fallbackActions : 0;
  const knowledgeRaw = test ? test.score : 0;
  const knowledgeScore = knowledgePoints(knowledgeRaw);
  const emailCheckerScore = emailCheckerPoints(actionsCount);
  const finalScore = knowledgeScore + emailCheckerScore;
  const { status, description } = statusForScore(finalScore);
  return {
    finalScore,
    knowledgeScore,
    emailCheckerScore,
    knowledgeRaw,
    knowledgeTotal: 5,
    actionsCount,
    status,
    description,
  };
}

router.get('/demo', (_req, res) => {
  res.json({
    emails: DEMO_EMAILS,
    notice:
      'This is a demo. Do not enter a real email. Use one of the sample addresses to load synthetic breach results.',
  });
});

router.get('/state', (req, res) => {
  const row = getOrCreateSession(req.sessionId);
  res.json({
    dashboard: parseDashboard(row),
    score: computeScore(row),
  });
});

router.put('/state', (req, res) => {
  const dashboard = req.body?.dashboard;
  if (!dashboard || typeof dashboard !== 'object') {
    return res.status(400).json({ error: 'dashboard object is required.' });
  }
  saveDashboard(req.sessionId, {
    workspaces: dashboard.workspaces ?? {},
    emailOrder: Array.isArray(dashboard.emailOrder) ? dashboard.emailOrder : [],
    currentEmail: dashboard.currentEmail ?? null,
    view: dashboard.view ?? 'empty',
    theme: dashboard.theme === 'light' ? 'light' : 'dark',
    actionSort: dashboard.actionSort ?? { column: null, direction: 'asc' },
    noticeSort: dashboard.noticeSort ?? { column: null, direction: 'asc' },
  });
  const row = getOrCreateSession(req.sessionId);
  res.json({ ok: true, score: computeScore(row) });
});

router.get('/getData', async (req, res) => {
  const ip = clientIp(req);
  const lookupUrl = isLocalIp(ip) ? 'https://apip.cc/json' : `https://apip.cc/${encodeURIComponent(ip)}/json`;
  try {
    let response = await fetch(lookupUrl);
    if (!response.ok && lookupUrl !== 'https://apip.cc/json') {
      response = await fetch('https://apip.cc/json');
    }
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const data = await response.json();
    res.json({
      ...data,
      query: data.query || data.ip,
    });
  } catch (err) {
    console.error('Error fetching API data: ', err);
    res.status(500).json({ error: 'Error fetching data from external API' });
  }
});

router.get('/breaches', (req, res) => {
  const email = String(req.query.email || '')
    .trim()
    .toLowerCase();
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email query is required.' });
  }

  const hash = hashEmail(email);
  const count = 8 + (hash % 5);
  const picked = [];
  for (let i = 0; i < count; i += 1) {
    picked.push(BREACHES[(hash + i * 7) % BREACHES.length]);
  }

  const actionBreaches = BREACHES.filter((b) => b.severity === 'action');
  picked[0] = actionBreaches[hash % actionBreaches.length];
  picked[1] = actionBreaches[(hash + 1) % actionBreaches.length];

  const seen = new Set();
  const unique = picked.filter((b) => {
    if (seen.has(b.id)) return false;
    seen.add(b.id);
    return true;
  });

  res.json({ email, results: unique });
});

router.get('/test', (_req, res) => {
  res.json({ questions: QUESTIONS, total: QUESTIONS.length });
});

router.post('/test', (req, res) => {
  const answers = Array.isArray(req.body?.answers) ? req.body.answers : [];
  if (answers.length !== CORRECT_ANSWERS.length) {
    return res.status(400).json({ error: 'Expected 5 answers.' });
  }

  let score = 0;
  answers.forEach((answer, index) => {
    if (answer === CORRECT_ANSWERS[index]) score += 1;
  });

  saveTest(req.sessionId, score, answers);
  const row = getOrCreateSession(req.sessionId);
  res.json({ score, total: 5, privacyScore: computeScore(row) });
});

router.get('/score', (req, res) => {
  const row = getOrCreateSession(req.sessionId);
  const fallback = Number.parseInt(String(req.query.actions ?? ''), 10);
  res.json(computeScore(row, Number.isFinite(fallback) ? fallback : undefined));
});

export default router;
