import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'reports.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const VALID_CATEGORIES = [
  'Security',
  'Harassment',
  'Corruption',
  'Technical',
  'Other'
];

export const VALID_STATUSES = [
  'SUBMITTED',
  'UNDER_INVESTIGATION',
  'ACTION_TAKEN',
  'RESOLVED',
  'DISMISSED'
];

export const STATUS_LABELS = {
  SUBMITTED: 'Submitted & Pending Review',
  UNDER_INVESTIGATION: 'Under Active Investigation',
  ACTION_TAKEN: 'Action Taken',
  RESOLVED: 'Case Resolved',
  DISMISSED: 'Closed / Dismissed'
};

// Seed sample initial data if reports.json does not exist
function initializeStore() {
  if (!fs.existsSync(DATA_FILE)) {
    const initialReports = [
      {
        id: crypto.randomUUID(),
        trackingId: 'WD-SEC-8921',
        trackingKey: crypto.randomBytes(16).toString('hex'),
        category: 'Security',
        description: 'Unprotected AWS credentials found committed to a public GitHub repository belonging to the cloud infra team.',
        evidenceUrl: 'https://pastebin.com/raw/sample-redacted-leak',
        status: 'UNDER_INVESTIGATION',
        priority: 'HIGH',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        timeline: [
          {
            id: crypto.randomUUID(),
            type: 'REPORT_CREATED',
            text: 'Confidential report received into WhistleDrop system.',
            author: 'System',
            createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
            isPublic: true
          },
          {
            id: crypto.randomUUID(),
            type: 'STATUS_CHANGE',
            text: 'Status updated to Under Active Investigation by SecOps triage.',
            author: 'Moderator',
            createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
            isPublic: true
          },
          {
            id: crypto.randomUUID(),
            type: 'INTERNAL_NOTE',
            text: 'Keys revoked immediately in AWS IAM. Auditing CloudTrail logs for unauthorized usage.',
            author: 'Moderator',
            createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
            isPublic: false
          }
        ]
      },
      {
        id: crypto.randomUUID(),
        trackingId: 'WD-COR-4103',
        trackingKey: crypto.randomBytes(16).toString('hex'),
        category: 'Corruption',
        description: 'Procurement bid manipulation in vendor selection process for Q3 IT equipment renewal.',
        evidenceUrl: 'https://docs.internal-procurement-records.test/audit-ref-77',
        status: 'SUBMITTED',
        priority: 'MEDIUM',
        createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
        timeline: [
          {
            id: crypto.randomUUID(),
            type: 'REPORT_CREATED',
            text: 'Confidential report submitted anonymously.',
            author: 'System',
            createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
            isPublic: true
          }
        ]
      }
    ];

    fs.writeFileSync(DATA_FILE, JSON.stringify(initialReports, null, 2), 'utf8');
  }
}

initializeStore();

function readReports() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading reports store:', err);
    return [];
  }
}

function writeReports(reports) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(reports, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing reports store:', err);
  }
}

export function generateTrackingId(category) {
  const prefix = (category || 'GEN').substring(0, 3).toUpperCase();
  const randomSegment = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `WD-${prefix}-${randomSegment}`;
}

export function generateTrackingKey() {
  return crypto.randomBytes(16).toString('hex');
}

export const ReportStore = {
  getAll() {
    return readReports();
  },

  getById(id) {
    const reports = readReports();
    return reports.find(r => r.id === id);
  },

  getByTracking(trackingId, trackingKey) {
    const reports = readReports();
    const report = reports.find(r => r.trackingId.toUpperCase() === trackingId.toUpperCase());
    if (!report) return null;
    // Verify tracking key if provided
    if (trackingKey && report.trackingKey !== trackingKey) {
      return { unauthorized: true };
    }
    return report;
  },

  create({ category, description, evidenceUrl, priority = 'MEDIUM' }) {
    const reports = readReports();
    const now = new Date().toISOString();
    const trackingId = generateTrackingId(category);
    const trackingKey = generateTrackingKey();

    const newReport = {
      id: crypto.randomUUID(),
      trackingId,
      trackingKey,
      category,
      description: description.trim(),
      evidenceUrl: evidenceUrl ? evidenceUrl.trim() : null,
      status: 'SUBMITTED',
      priority: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(priority) ? priority : 'MEDIUM',
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          id: crypto.randomUUID(),
          type: 'REPORT_CREATED',
          text: 'Confidential report securely received and registered.',
          author: 'System',
          createdAt: now,
          isPublic: true
        }
      ]
    };

    reports.unshift(newReport);
    writeReports(reports);
    return newReport;
  },

  updateStatus(id, newStatus, publicMessage, internalNote) {
    const reports = readReports();
    const index = reports.findIndex(r => r.id === id);
    if (index === -1) return null;

    const report = reports[index];
    const now = new Date().toISOString();
    report.status = newStatus;
    report.updatedAt = now;

    // Add status change entry to timeline
    report.timeline.push({
      id: crypto.randomUUID(),
      type: 'STATUS_CHANGE',
      text: publicMessage || `Status changed to: ${STATUS_LABELS[newStatus] || newStatus}`,
      author: 'Moderator',
      createdAt: now,
      isPublic: true
    });

    if (internalNote) {
      report.timeline.push({
        id: crypto.randomUUID(),
        type: 'INTERNAL_NOTE',
        text: internalNote,
        author: 'Moderator',
        createdAt: now,
        isPublic: false
      });
    }

    writeReports(reports);
    return report;
  },

  addMessage(trackingId, trackingKey, messageText, evidenceUrl) {
    const reports = readReports();
    const index = reports.findIndex(r => r.trackingId.toUpperCase() === trackingId.toUpperCase());
    if (index === -1) return null;

    const report = reports[index];
    if (report.trackingKey !== trackingKey) {
      return { unauthorized: true };
    }

    const now = new Date().toISOString();
    report.updatedAt = now;

    report.timeline.push({
      id: crypto.randomUUID(),
      type: 'REPORTER_MESSAGE',
      text: messageText,
      evidenceUrl: evidenceUrl || null,
      author: 'Reporter',
      createdAt: now,
      isPublic: true
    });

    writeReports(reports);
    return report;
  },

  addModeratorNote(id, noteText, isPublic = false) {
    const reports = readReports();
    const index = reports.findIndex(r => r.id === id);
    if (index === -1) return null;

    const report = reports[index];
    const now = new Date().toISOString();
    report.updatedAt = now;

    report.timeline.push({
      id: crypto.randomUUID(),
      type: isPublic ? 'MODERATOR_UPDATE' : 'INTERNAL_NOTE',
      text: noteText,
      author: 'Moderator',
      createdAt: now,
      isPublic: Boolean(isPublic)
    });

    writeReports(reports);
    return report;
  },

  getStats() {
    const reports = readReports();
    const total = reports.length;
    const byCategory = {};
    const byStatus = {};

    VALID_CATEGORIES.forEach(c => { byCategory[c] = 0; });
    VALID_STATUSES.forEach(s => { byStatus[s] = 0; });

    reports.forEach(r => {
      byCategory[r.category] = (byCategory[r.category] || 0) + 1;
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    });

    return {
      totalReports: total,
      pendingCount: byStatus['SUBMITTED'] || 0,
      activeInvestigations: byStatus['UNDER_INVESTIGATION'] || 0,
      resolvedCount: byStatus['RESOLVED'] || 0,
      byCategory,
      byStatus
    };
  }
};
