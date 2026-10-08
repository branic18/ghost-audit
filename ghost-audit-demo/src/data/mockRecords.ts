import type { BreachRecord, ChecklistItem } from '../types';

let uid = 0;
function nextId(prefix: string) {
  uid += 1;
  return `${prefix}-${uid}`;
}

function secureChecklist(): ChecklistItem[] {
  return [
    {
      id: nextId('sc'),
      label:
        'I will be more alert for phishing/spam and consider monitoring the email address',
      checked: false,
    },
    {
      id: nextId('sc'),
      label:
        "I changed this account password and have changed it anywhere else it was reused",
      checked: false,
    },
  ];
}

function deleteChecklist(): ChecklistItem[] {
  const labels = [
    'I changed my password to a new, unique password.',
    'I changed the same password anywhere it was reused.',
    'I enabled two-factor authentication (2FA) if available.',
    'I reviewed recent account activity for anything suspicious.',
    'I downloaded any data or files I wanted to keep.',
    'I removed payment methods and personal information where possible.',
    'I disconnected linked apps and services from the account.',
    "I deleted the account through the service's official settings or privacy page.",
    'I confirmed the deletion and saved any confirmation I received.',
    'I will continue to stay alert for phishing and spam, since previously exposed information may continue circulating.',
  ];
  return labels.map((label) => ({ id: nextId('dc'), label, checked: false }));
}

interface Seed {
  domain: string;
  breachDate: string;
  addedDate: string;
  dataTypes: string[];
  accountsAffected: number;
  verified: boolean;
  summary: string;
  type: 'action' | 'notice';
  monitoringNote: string;
}

const BASE_SEEDS: Seed[] = [
  {
    domain: 'Adobe.com',
    breachDate: '2013-10-04',
    addedDate: '2013-12-04',
    dataTypes: ['Email', 'Password'],
    accountsAffected: 152445165,
    verified: true,
    summary:
      'In October 2013, 153 million Adobe accounts were breached with each containing an internal ID, username, email, encrypted password and a password hint in plain text. The password cryptography was poorly done and many were quickly resolved back to plain text. The unencrypted hints also disclosed much about the passwords adding further to the risk that hundreds of millions of Adobe customers already faced.',
    type: 'action',
    monitoringNote: '',
  },
  {
    domain: 'LinkedIn.com',
    breachDate: '2012-05-05',
    addedDate: '2016-05-18',
    dataTypes: ['Email', 'Password'],
    accountsAffected: 164611595,
    verified: true,
    summary:
      'In May 2012, LinkedIn suffered a data breach that exposed the SHA-1 hashed passwords of nearly all its users. The breach was not publicly known to be a much larger scale until 2016, when the data appeared for sale online, containing email addresses and unsalted password hashes for over 164 million accounts.',
    type: 'action',
    monitoringNote: '',
  },
  {
    domain: 'Dropbox.com',
    breachDate: '2012-07-01',
    addedDate: '2016-08-31',
    dataTypes: ['Email', 'Password'],
    accountsAffected: 68648009,
    verified: true,
    summary:
      'A 2012 Dropbox breach, disclosed publicly in 2016, exposed the email addresses and salted password hashes of over 68 million accounts. The breach was traced back to an employee password reused from a previously breached site.',
    type: 'action',
    monitoringNote: '',
  },
  {
    domain: 'MySpace.com',
    breachDate: '2008-07-01',
    addedDate: '2016-05-31',
    dataTypes: ['Email'],
    accountsAffected: 359420698,
    verified: true,
    summary:
      'Believed to have occurred in 2008, the MySpace breach was revealed in 2016 and exposed email addresses, usernames and weakly hashed passwords for over 359 million accounts, one of the largest breaches disclosed at the time.',
    type: 'notice',
    monitoringNote:
      'Only your email address exposed, but be more alert for phishing/spam; consider monitoring the address.',
  },
  {
    domain: 'Yahoo.com',
    breachDate: '2013-08-01',
    addedDate: '2016-12-14',
    dataTypes: ['Email'],
    accountsAffected: 3000000000,
    verified: true,
    summary:
      'Yahoo disclosed that a 2013 breach affected all 3 billion of its user accounts, making it the largest known data breach. Exposed data included names, email addresses, phone numbers and security questions.',
    type: 'notice',
    monitoringNote:
      'Only your email address exposed, but be more alert for phishing/spam; consider monitoring the address.',
  },
  {
    domain: 'Canva.com',
    breachDate: '2019-05-24',
    addedDate: '2019-05-28',
    dataTypes: ['Email'],
    accountsAffected: 137272116,
    verified: true,
    summary:
      'In May 2019, design platform Canva suffered a breach exposing usernames, email addresses and, for some users, city and country information. Passwords were salted and hashed with bcrypt.',
    type: 'notice',
    monitoringNote:
      'Only your email address exposed, but be more alert for phishing/spam; consider monitoring the address.',
  },
  {
    domain: 'Tumblr.com',
    breachDate: '2013-02-28',
    addedDate: '2016-05-12',
    dataTypes: ['Email'],
    accountsAffected: 65469298,
    verified: true,
    summary:
      'Tumblr disclosed in 2016 that a set of user credentials from 2013 had been circulating, exposing email addresses and salted SHA-1 password hashes for over 65 million accounts.',
    type: 'notice',
    monitoringNote:
      'Only your email address exposed, but be more alert for phishing/spam; consider monitoring the address.',
  },
  {
    domain: 'Disqus.com',
    breachDate: '2012-07-01',
    addedDate: '2017-10-06',
    dataTypes: ['Email'],
    accountsAffected: 17549900,
    verified: true,
    summary:
      'A 2012 Disqus database backup was exposed in 2017, containing email addresses, usernames and salted SHA-1 password hashes for more than 17.5 million subscribers.',
    type: 'notice',
    monitoringNote:
      'Only your email address exposed, but be more alert for phishing/spam; consider monitoring the address.',
  },
  {
    domain: 'Zynga.com',
    breachDate: '2019-09-12',
    addedDate: '2019-12-02',
    dataTypes: ['Email'],
    accountsAffected: 172869660,
    verified: true,
    summary:
      'Game developer Zynga (Words With Friends) was breached in September 2019, exposing email addresses, login IDs, and hashed passwords for approximately 173 million accounts.',
    type: 'notice',
    monitoringNote:
      'Only your email address exposed, but be more alert for phishing/spam; consider monitoring the address.',
  },
  {
    domain: 'Evite.com',
    breachDate: '2013-08-11',
    addedDate: '2019-04-16',
    dataTypes: ['Email'],
    accountsAffected: 100986480,
    verified: true,
    summary:
      'Online invitation service Evite identified a breach where a 2013 data file containing email addresses, names, and in some cases dates of birth and phone numbers was found being traded in 2019.',
    type: 'notice',
    monitoringNote:
      'Only your email address exposed, but be more alert for phishing/spam; consider monitoring the address.',
  },
  {
    domain: 'Chegg.com',
    breachDate: '2018-04-29',
    addedDate: '2018-09-26',
    dataTypes: ['Email'],
    accountsAffected: 39790132,
    verified: true,
    summary:
      'Textbook rental service Chegg reported in 2018 that an unauthorized party gained access to a database containing usernames, email addresses and hashed passwords for nearly 40 million users.',
    type: 'notice',
    monitoringNote:
      'Only your email address exposed, but be more alert for phishing/spam; consider monitoring the address.',
  },
  {
    domain: 'VK.com',
    breachDate: '2012-06-01',
    addedDate: '2016-06-06',
    dataTypes: ['Email'],
    accountsAffected: 93338602,
    verified: true,
    summary:
      'A 2012 breach of Russian social network VK (VKontakte) surfaced in 2016, exposing plain-text passwords and email addresses for over 93 million accounts.',
    type: 'notice',
    monitoringNote:
      'Only your email address exposed, but be more alert for phishing/spam; consider monitoring the address.',
  },
  {
    domain: 'Poshmark.com',
    breachDate: '2019-07-01',
    addedDate: '2019-08-01',
    dataTypes: ['Email'],
    accountsAffected: 39271611,
    verified: true,
    summary:
      'Fashion marketplace Poshmark disclosed a 2019 breach affecting usernames, email addresses, and salted SHA-256 password hashes for over 39 million users.',
    type: 'notice',
    monitoringNote:
      'Only your email address exposed, but be more alert for phishing/spam; consider monitoring the address.',
  },
  {
    domain: 'Houzz.com',
    breachDate: '2018-12-25',
    addedDate: '2019-02-01',
    dataTypes: ['Email'],
    accountsAffected: 48912908,
    verified: true,
    summary:
      'Home design platform Houzz notified users of a 2018 breach exposing publicly visible profile information plus internal identifiers and, for some users, hashed passwords.',
    type: 'notice',
    monitoringNote:
      'Only your email address exposed, but be more alert for phishing/spam; consider monitoring the address.',
  },
];

export interface ApiBreachSeed {
  id: string;
  domain: string;
  breachDate: string;
  addedDate: string;
  dataTypes: string[];
  pwnCount: number;
  verified: boolean;
  description: string;
  severity: 'action' | 'notice';
  monitoringNote: string;
}

function buildRecord(seed: Seed): BreachRecord {
  return {
    id: nextId('rec'),
    domain: seed.domain,
    breachDate: seed.breachDate,
    addedDate: seed.addedDate,
    dataTypes: seed.dataTypes,
    accountsAffected: seed.accountsAffected,
    verified: seed.verified,
    summary: seed.summary,
    type: seed.type,
    isOpen: false,
    selection: 'None',
    secureChecklist: secureChecklist(),
    deleteChecklist: deleteChecklist(),
    notesEnabled: false,
    notesText: '',
    notesMode: 'add',
    monitoringNote: seed.monitoringNote,
  };
}

export function recordsFromApiResults(results: ApiBreachSeed[]): BreachRecord[] {
  return results.map((row) =>
    buildRecord({
      domain: row.domain,
      breachDate: row.breachDate,
      addedDate: row.addedDate,
      dataTypes: row.dataTypes,
      accountsAffected: row.pwnCount,
      verified: row.verified,
      summary: row.description,
      type: row.severity,
      monitoringNote: row.monitoringNote,
    }),
  );
}

/** Deterministically build a workspace of records for a searched email address. */
export function generateRecordsForEmail(email: string): BreachRecord[] {
  // Simple deterministic hash so the same email always yields the same "results"
  let hash = 0;
  for (let i = 0; i < email.length; i += 1) {
    hash = (hash * 31 + email.charCodeAt(i)) >>> 0;
  }
  const count = 8 + (hash % 5); // 8-12 results
  const seeds: Seed[] = [];
  for (let i = 0; i < count; i += 1) {
    seeds.push(BASE_SEEDS[(hash + i * 7) % BASE_SEEDS.length]);
  }
  // Ensure at least 2 action-required results for a good demo journey
  const actionSeeds = BASE_SEEDS.filter((s) => s.type === 'action');
  seeds[0] = actionSeeds[hash % actionSeeds.length];
  seeds[1] = actionSeeds[(hash + 1) % actionSeeds.length];
  // De-dupe by domain, keep order
  const seen = new Set<string>();
  const unique = seeds.filter((s) => {
    if (seen.has(s.domain)) return false;
    seen.add(s.domain);
    return true;
  });
  return unique.map(buildRecord);
}
