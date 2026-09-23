import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import reportsRouter from './src/routes/reports.js';
import moderatorRouter from './src/routes/moderator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

// Strip client identifiers for anonymity (No IP or User-Agent logging)
app.use((req, res, next) => {
  // Discard IP address from request headers to prevent accidental leakage in logs
  delete req.headers['x-forwarded-for'];
  delete req.headers['x-real-ip'];
  delete req.headers['user-agent'];
  next();
});

app.use(express.json());

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'WhistleDrop Confidential Reporting Backend',
    version: '1.0.0',
    anonymityGuaranteed: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Mount modular API routes
app.use('/api', reportsRouter);
app.use('/api/moderator', moderatorRouter);

// Main Web Interface for Testing, Submitting, Tracking, and Moderating
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WhistleDrop — Speak Without Being Seen</title>
  <meta name="description" content="Confidential anonymous reporting backend system. Speak without being seen.">
  <meta property="og:title" content="WhistleDrop — Speak Without Being Seen">
  <meta property="og:description" content="Confidential anonymous reporting backend system.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #111827;
      --card-subtle: #1a2234;
      --border: #1f293d;
      --border-accent: #374151;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --primary: #3b82f6;
      --primary-hover: #2563eb;
      --accent: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --purple: #8b5cf6;
      --code-bg: #0b111e;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 0;
      margin: 0;
      min-height: 100vh;
    }
    header {
      background: rgba(17, 24, 39, 0.95);
      border-bottom: 1px solid var(--border);
      padding: 18px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 50;
      backdrop-filter: blur(8px);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: #ffffff;
      box-shadow: 0 2px 10px rgba(59, 130, 246, 0.3);
    }
    .brand-title {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #fff;
    }
    .brand-tagline {
      font-size: 12px;
      color: #94a3b8;
      font-weight: 500;
    }
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
    }
    .pulse-dot {
      width: 7px;
      height: 7px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 8px #10b981;
    }
    .main-layout {
      max-width: 1200px;
      margin: 0 auto;
      padding: 28px 20px 60px;
    }
    .nav-tabs {
      display: flex;
      gap: 10px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 14px;
      margin-bottom: 28px;
      overflow-x: auto;
    }
    .tab-btn {
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-muted);
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }
    .tab-btn:hover {
      color: #fff;
      background: var(--card-subtle);
    }
    .tab-btn.active {
      background: var(--primary);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    .tab-content {
      display: none;
    }
    .tab-content.active {
      display: block;
      animation: fadeIn 0.2s ease-in-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 24px;
    }
    @media (max-width: 860px) {
      .grid-2 {
        grid-template-columns: 1fr;
      }
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }
    .card-title {
      font-size: 18px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .card-desc {
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 20px;
    }
    .privacy-notice {
      background: rgba(59, 130, 246, 0.08);
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: 8px;
      padding: 14px 16px;
      margin-bottom: 20px;
      font-size: 13px;
      color: #bfdbfe;
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }
    .form-group {
      margin-bottom: 18px;
    }
    label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #e5e7eb;
      margin-bottom: 6px;
    }
    select, input, textarea {
      width: 100%;
      background: var(--code-bg);
      border: 1px solid var(--border-accent);
      border-radius: 8px;
      padding: 12px 14px;
      color: #ffffff;
      font-size: 14px;
      font-family: inherit;
      outline: none;
      transition: border-color 0.15s;
    }
    select:focus, input:focus, textarea:focus {
      border-color: var(--primary);
    }
    textarea {
      resize: vertical;
      min-height: 120px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: var(--primary);
      color: #ffffff;
      border: none;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s, transform 0.1s;
    }
    .btn:hover {
      background: var(--primary-hover);
    }
    .btn:active {
      transform: scale(0.98);
    }
    .btn-secondary {
      background: var(--card-subtle);
      border: 1px solid var(--border-accent);
      color: #d1d5db;
    }
    .btn-secondary:hover {
      background: #232e44;
      color: #fff;
    }
    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }
    .result-box {
      margin-top: 20px;
      padding: 18px;
      border-radius: 8px;
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.3);
      display: none;
    }
    .key-display {
      background: #000000;
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 12px;
      margin: 10px 0;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      color: #38bdf8;
      word-break: break-all;
    }
    .tag {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .tag-Security { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
    .tag-Harassment { background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); }
    .tag-Corruption { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .tag-Technical { background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
    .tag-Other { background: rgba(156, 163, 175, 0.2); color: #d1d5db; border: 1px solid rgba(156, 163, 175, 0.3); }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
    }
    .status-SUBMITTED { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .status-UNDER_INVESTIGATION { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
    .status-ACTION_TAKEN { background: rgba(139, 92, 246, 0.15); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.3); }
    .status-RESOLVED { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .status-DISMISSED { background: rgba(107, 114, 128, 0.15); color: #9ca3af; border: 1px solid rgba(107, 114, 128, 0.3); }

    .timeline {
      position: relative;
      margin-top: 20px;
      padding-left: 20px;
      border-left: 2px solid var(--border-accent);
    }
    .timeline-item {
      position: relative;
      margin-bottom: 20px;
    }
    .timeline-point {
      position: absolute;
      left: -27px;
      top: 4px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--primary);
      border: 2px solid var(--bg);
    }
    .timeline-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 4px;
    }
    .timeline-content {
      background: var(--card-subtle);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 12px 14px;
      font-size: 13px;
    }
    .timeline-internal {
      border-left: 3px solid #ef4444;
      background: rgba(239, 68, 68, 0.05);
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    @media (max-width: 768px) {
      .stats-row {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 16px;
    }
    .stat-num {
      font-size: 26px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 2px;
    }
    .stat-label {
      font-size: 12px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .report-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .report-table th {
      text-align: left;
      padding: 12px;
      border-bottom: 1px solid var(--border);
      color: var(--text-muted);
      font-weight: 600;
    }
    .report-table td {
      padding: 12px;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
    }
    .report-table tr:hover {
      background: var(--card-subtle);
    }
    .mono {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
    }
    pre {
      background: var(--code-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 14px;
      color: #a5f3fc;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      overflow-x: auto;
      margin: 10px 0;
    }
  </style>
</head>
<body>

  <header id="app-header">
    <div class="brand" id="app-brand">
      <div class="brand-icon">🛡️</div>
      <div>
        <div class="brand-title">WhistleDrop</div>
        <div class="brand-tagline">Speak Without Being Seen • Confidential Reporting Backend</div>
      </div>
    </div>
    <div class="status-pill" id="backend-status-pill">
      <span class="pulse-dot"></span> Zero-PII Anonymous Engine Active
    </div>
  </header>

  <div class="main-layout" id="main-content">

    <nav class="nav-tabs" id="nav-tabs-bar">
      <button class="tab-btn active" id="tab-btn-submit" onclick="switchTab('submit')">
        <span>✍️</span> Submit Anonymous Report
      </button>
      <button class="tab-btn" id="tab-btn-track" onclick="switchTab('track')">
        <span>🔍</span> Track My Report
      </button>
      <button class="tab-btn" id="tab-btn-mod" onclick="switchTab('moderator')">
        <span>⚖️</span> Moderator Portal
      </button>
      <button class="tab-btn" id="tab-btn-api" onclick="switchTab('api')">
        <span>⚡</span> API Documentation & Console
      </button>
    </nav>

    <!-- TAB 1: SUBMIT ANONYMOUS REPORT -->
    <div id="tab-submit" class="tab-content active">
      <div class="grid-2">
        <div class="card" id="submit-card">
          <div class="card-title">Confidential Submission Form</div>
          <div class="card-desc">No login, registration, name, email, or IP address is ever collected or logged.</div>

          <div class="privacy-notice">
            <span>🔒</span>
            <div>
              <strong>Full Anonymity Protected:</strong> When you submit, our backend generates a unique cryptographic <strong>Tracking ID</strong> and <strong>Secret Key</strong>. Save them to track progress and receive responses.
            </div>
          </div>

          <form id="report-form" onsubmit="handleReportSubmit(event)">
            <div class="form-group">
              <label for="report-category">Report Category *</label>
              <select id="report-category" required>
                <option value="Security">Security (Data breaches, credential leaks, cyber threats)</option>
                <option value="Harassment">Harassment & Discrimination (Hostile environment, retaliation)</option>
                <option value="Corruption">Corruption & Fraud (Bribery, financial malpractice, bid rigging)</option>
                <option value="Technical">Technical Malpractice (Safety bypasses, code falsification)</option>
                <option value="Other">Other Serious Grievances</option>
              </select>
            </div>

            <div class="form-group">
              <label for="report-description">Description of Incident *</label>
              <textarea id="report-description" required placeholder="Describe what happened with as much objective detail as possible (what occurred, who was affected, timeframe, impacts)..." minlength="10"></textarea>
            </div>

            <div class="form-group">
              <label for="report-evidence">Optional Evidence / Reference URL</label>
              <input type="url" id="report-evidence" placeholder="https://drive.google.com/... or pastebin or document link">
            </div>

            <div class="form-group">
              <label for="report-priority">Estimated Severity / Urgency</label>
              <select id="report-priority">
                <option value="MEDIUM">Medium — Standard organizational matter</option>
                <option value="HIGH">High — Active breach or critical concern</option>
                <option value="CRITICAL">Critical — Immediate legal or physical danger</option>
                <option value="LOW">Low — Non-urgent feedback or minor discrepancy</option>
              </select>
            </div>

            <button type="submit" class="btn" id="btn-submit-report" style="width: 100%;">
              <span>🚀</span> Submit Anonymous Report
            </button>
          </form>

          <div id="submit-result" class="result-box">
            <h4 style="color: #34d399; margin-bottom: 6px;">Report Submitted Successfully!</h4>
            <p style="font-size: 13px; color: #d1d5db; margin-bottom: 12px;">
              Your confidential report has been encrypted and assigned tracking credentials. <strong>Save these credentials now; they cannot be recovered if lost!</strong>
            </p>
            <div class="key-display" id="display-tracking-creds"></div>
            <div style="display: flex; gap: 10px; margin-top: 14px;">
              <button class="btn btn-secondary btn-sm" id="btn-copy-creds" onclick="copyCreds()">📋 Copy Credentials</button>
              <button class="btn btn-sm" id="btn-go-track" onclick="trackFromSubmission()">🔍 Track Now</button>
            </div>
          </div>
        </div>

        <div>
          <div class="card" id="info-categories-card" style="margin-bottom: 20px;">
            <div class="card-title">Supported Categories</div>
            <div id="categories-container" style="display: flex; flex-direction: column; gap: 12px;">
              <!-- Loaded via API -->
              <div style="font-size: 13px; color: var(--text-muted);">Loading category definitions...</div>
            </div>
          </div>

          <div class="card" id="info-security-card">
            <div class="card-title">How Privacy is Maintained</div>
            <ul style="font-size: 13px; color: var(--text-muted); padding-left: 18px; display: flex; flex-direction: column; gap: 8px;">
              <li><strong>Zero Account Creation:</strong> Reporters never sign up or reveal names, phone numbers, or emails.</li>
              <li><strong>No IP or User-Agent Logging:</strong> Network telemetry headers are stripped at the middleware layer.</li>
              <li><strong>Zero-Knowledge Cryptographic Tracking:</strong> The secret tracking key ensures only the original reporter can track progress and provide follow-up evidence.</li>
              <li><strong>Air-Gapped Internal Notes:</strong> Sensitive investigator deliberations remain invisible to the reporter while public milestones are shared cleanly.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: TRACK MY REPORT -->
    <div id="tab-track" class="tab-content">
      <div class="card" id="track-input-card" style="max-width: 760px; margin: 0 auto 24px;">
        <div class="card-title">Track Confidential Report</div>
        <div class="card-desc">Enter your Tracking ID and Secret Tracking Key to view status updates and communicate anonymously with investigators.</div>

        <form id="track-form" onsubmit="handleTrackReport(event)">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div class="form-group">
              <label for="track-id-input">Tracking ID *</label>
              <input type="text" id="track-id-input" placeholder="e.g. WD-SEC-8921" required>
            </div>
            <div class="form-group">
              <label for="track-key-input">Secret Tracking Key *</label>
              <input type="text" id="track-key-input" placeholder="32-character hex key" required>
            </div>
          </div>
          <button type="submit" class="btn" id="btn-fetch-track">
            <span>🔎</span> Check Report Status
          </button>
        </form>
      </div>

      <div id="track-details-container" style="max-width: 760px; margin: 0 auto; display: none;">
        <div class="card" id="track-report-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
            <div>
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                <span class="mono" id="track-display-id" style="font-size: 16px; font-weight: 700; color: #fff;"></span>
                <span id="track-display-cat" class="tag"></span>
              </div>
              <div style="font-size: 12px; color: var(--text-muted);" id="track-display-dates"></div>
            </div>
            <div id="track-display-status"></div>
          </div>

          <div style="background: var(--card-subtle); padding: 16px; border-radius: 8px; margin-bottom: 20px;">
            <div style="font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 4px;">INITIAL REPORT DESCRIPTION</div>
            <div id="track-display-desc" style="font-size: 14px; color: #f3f4f6; white-space: pre-wrap;"></div>
            <div id="track-display-evidence" style="margin-top: 10px; font-size: 13px;"></div>
          </div>

          <div class="card-title" style="font-size: 15px;">Confidential Investigation Timeline</div>
          <div class="timeline" id="track-timeline"></div>

          <!-- Add Follow-up Message -->
          <div style="margin-top: 24px; border-top: 1px solid var(--border); padding-top: 20px;">
            <div class="card-title" style="font-size: 15px;">Send Anonymous Follow-Up</div>
            <div class="card-desc">Provide additional evidence, clarify details, or respond to moderator inquiries without compromising your identity.</div>

            <form id="followup-form" onsubmit="handleFollowupSubmit(event)">
              <div class="form-group">
                <textarea id="followup-message" placeholder="Type your follow-up statement..." rows="3" required></textarea>
              </div>
              <div class="form-group">
                <input type="url" id="followup-evidence" placeholder="Optional additional evidence link (URL)">
              </div>
              <button type="submit" class="btn btn-secondary btn-sm" id="btn-send-followup">
                <span>💬</span> Submit Follow-Up Anonymously
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: MODERATOR PORTAL -->
    <div id="tab-moderator" class="tab-content">
      <div class="stats-row" id="stats-container">
        <div class="stat-card">
          <div class="stat-num" id="stat-total">-</div>
          <div class="stat-label">Total Reports</div>
        </div>
        <div class="stat-card">
          <div class="stat-num" id="stat-pending" style="color: #fbbf24;">-</div>
          <div class="stat-label">Pending Triage</div>
        </div>
        <div class="stat-card">
          <div class="stat-num" id="stat-investigating" style="color: #60a5fa;">-</div>
          <div class="stat-label">Under Investigation</div>
        </div>
        <div class="stat-card">
          <div class="stat-num" id="stat-resolved" style="color: #34d399;">-</div>
          <div class="stat-label">Resolved Cases</div>
        </div>
      </div>

      <div class="card" id="mod-filter-card" style="margin-bottom: 20px;">
        <div style="display: flex; gap: 14px; flex-wrap: wrap; align-items: center; justify-content: space-between;">
          <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
            <select id="mod-filter-category" onchange="loadModeratorReports()" style="width: auto;">
              <option value="">All Categories</option>
              <option value="Security">Security</option>
              <option value="Harassment">Harassment</option>
              <option value="Corruption">Corruption</option>
              <option value="Technical">Technical</option>
              <option value="Other">Other</option>
            </select>
            <select id="mod-filter-status" onchange="loadModeratorReports()" style="width: auto;">
              <option value="">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_INVESTIGATION">Under Investigation</option>
              <option value="ACTION_TAKEN">Action Taken</option>
              <option value="RESOLVED">Resolved</option>
              <option value="DISMISSED">Dismissed</option>
            </select>
            <input type="text" id="mod-search" placeholder="Search keyword or ID..." oninput="loadModeratorReports()" style="width: 220px;">
          </div>
          <button class="btn btn-secondary btn-sm" onclick="loadModeratorReports()">🔄 Refresh</button>
        </div>
      </div>

      <div class="card" id="mod-table-card">
        <div class="card-title">Confidential Incident Registry</div>
        <div style="overflow-x: auto;">
          <table class="report-table" id="mod-reports-table">
            <thead>
              <tr>
                <th>Tracking ID</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Description Preview</th>
                <th>Status</th>
                <th>Date Received</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="mod-reports-body">
              <tr><td colspan="7" style="text-align: center; color: var(--text-muted);">Loading reports...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Moderator Detail Modal/Drawer -->
      <div id="mod-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 100; align-items: center; justify-content: center; padding: 20px;">
        <div class="card" style="max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto; position: relative;">
          <button onclick="closeModModal()" style="position: absolute; right: 20px; top: 20px; background: transparent; border: none; color: #fff; font-size: 20px; cursor: pointer;">✕</button>
          
          <div class="card-title" id="mod-modal-title">Report Details</div>
          <div id="mod-modal-body"></div>
        </div>
      </div>
    </div>

    <!-- TAB 4: API DOCUMENTATION & LIVE CONSOLE -->
    <div id="tab-api" class="tab-content">
      <div class="card" id="api-docs-card">
        <div class="card-title">WhistleDrop REST API Specification</div>
        <div class="card-desc">Integrate confidential reporting directly into command-line tools, mobile clients, Slackbots, or internal services.</div>

        <div style="display: flex; flex-direction: column; gap: 24px;">

          <!-- Endpoint 1 -->
          <div style="border: 1px solid var(--border); border-radius: 8px; padding: 16px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span class="tag" style="background: #10b981; color: #fff;">POST</span>
                <span class="mono" style="font-weight: 600; font-size: 14px;">/api/reports</span>
              </div>
              <span style="font-size: 12px; color: var(--text-muted);">Submit anonymous report</span>
            </div>
            <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">Submits a confidential report without user credentials. Returns tracking ID and tracking key.</p>
            <pre>curl -X POST "http://localhost:3000/api/reports" \\
  -H "Content-Type: application/json" \\
  -d '{
    "category": "Security",
    "description": "Suspicious privilege escalation script discovered on internal prod cluster.",
    "evidenceUrl": "https://pastebin.com/raw/example",
    "priority": "HIGH"
  }'</pre>
            <button class="btn btn-sm btn-secondary" onclick="testApiSubmit()">Run Test Call</button>
            <div id="resp-api-submit" style="display: none;"></div>
          </div>

          <!-- Endpoint 2 -->
          <div style="border: 1px solid var(--border); border-radius: 8px; padding: 16px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span class="tag" style="background: #3b82f6; color: #fff;">GET</span>
                <span class="mono" style="font-weight: 600; font-size: 14px;">/api/reports/track/:trackingId?key=:key</span>
              </div>
              <span style="font-size: 12px; color: var(--text-muted);">Track report progress</span>
            </div>
            <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">Retrieve sanitized status and public timeline for a confidential report.</p>
            <pre>curl "http://localhost:3000/api/reports/track/WD-SEC-8921?key=your_tracking_key"</pre>
            <button class="btn btn-sm btn-secondary" onclick="testApiTrack()">Run Test Call (Demo ID)</button>
            <div id="resp-api-track" style="display: none;"></div>
          </div>

          <!-- Endpoint 3 -->
          <div style="border: 1px solid var(--border); border-radius: 8px; padding: 16px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span class="tag" style="background: #8b5cf6; color: #fff;">PATCH</span>
                <span class="mono" style="font-weight: 600; font-size: 14px;">/api/moderator/reports/:id/status</span>
              </div>
              <span style="font-size: 12px; color: var(--text-muted);">Moderator: Update status</span>
            </div>
            <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">Allows authorized staff to update case status and optionally append public or internal notes.</p>
            <pre>curl -X PATCH "http://localhost:3000/api/moderator/reports/:id/status" \\
  -H "Content-Type: application/json" \\
  -d '{
    "status": "UNDER_INVESTIGATION",
    "publicMessage": "Case assigned to internal security auditors.",
    "internalNote": "Credentials rotated at 14:00 UTC."
  }'</pre>
          </div>

          <!-- Endpoint 4 -->
          <div style="border: 1px solid var(--border); border-radius: 8px; padding: 16px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span class="tag" style="background: #3b82f6; color: #fff;">GET</span>
                <span class="mono" style="font-weight: 600; font-size: 14px;">/api/moderator/stats</span>
              </div>
              <span style="font-size: 12px; color: var(--text-muted);">System Metrics</span>
            </div>
            <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">Returns aggregated breakdown by status and category.</p>
            <pre>curl "http://localhost:3000/api/moderator/stats"</pre>
            <button class="btn btn-sm btn-secondary" onclick="testApiStats()">Run Test Call</button>
            <div id="resp-api-stats" style="display: none;"></div>
          </div>

        </div>
      </div>
    </div>

  </div>

  <script>
    let currentCreatedCreds = null;
    let cachedCategories = [];

    // Tab Navigation
    function switchTab(tabId) {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      const btn = document.getElementById('tab-btn-' + tabId);
      const tab = document.getElementById('tab-' + tabId);
      if (btn) btn.classList.add('active');
      if (tab) tab.classList.add('active');

      if (tabId === 'moderator') {
        loadModeratorStats();
        loadModeratorReports();
      }
    }

    // Load categories on start
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        cachedCategories = data.categories || [];
        const container = document.getElementById('categories-container');
        if (!container) return;

        container.innerHTML = cachedCategories.map(cat => \`
          <div style="border-left: 3px solid var(--primary); padding-left: 10px;">
            <div style="font-size: 13px; font-weight: 700; color: #ffffff;">\${cat.title}</div>
            <div style="font-size: 12px; color: var(--text-muted);">\${cat.description}</div>
          </div>
        \`).join('');
      } catch (e) {
        console.error('Error loading categories:', e);
      }
    }

    // Handle Report Submission
    async function handleReportSubmit(e) {
      e.preventDefault();
      const btn = document.getElementById('btn-submit-report');
      btn.disabled = true;
      btn.textContent = 'Submitting anonymously...';

      const payload = {
        category: document.getElementById('report-category').value,
        description: document.getElementById('report-description').value,
        evidenceUrl: document.getElementById('report-evidence').value || undefined,
        priority: document.getElementById('report-priority').value
      };

      try {
        const res = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok && data.success) {
          currentCreatedCreds = {
            trackingId: data.trackingId,
            trackingKey: data.trackingKey
          };

          const resultBox = document.getElementById('submit-result');
          const credsDisplay = document.getElementById('display-tracking-creds');
          resultBox.style.display = 'block';
          credsDisplay.innerHTML = \`
            <div><strong>Tracking ID:</strong> <span style="color:#ffffff;">\${data.trackingId}</span></div>
            <div><strong>Tracking Key:</strong> <span style="color:#a5f3fc;">\${data.trackingKey}</span></div>
          \`;

          document.getElementById('report-form').reset();
        } else {
          alert('Submission error: ' + (data.message || data.error));
        }
      } catch (err) {
        alert('Failed to submit report: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>🚀</span> Submit Anonymous Report';
      }
    }

    function copyCreds() {
      if (!currentCreatedCreds) return;
      const text = \`WhistleDrop Tracking Credentials:\\nTracking ID: \${currentCreatedCreds.trackingId}\\nSecret Key: \${currentCreatedCreds.trackingKey}\\nKeep this strictly confidential.\`;
      navigator.clipboard.writeText(text);
      const btn = document.getElementById('btn-copy-creds');
      btn.textContent = '✓ Copied to Clipboard!';
      setTimeout(() => { btn.textContent = '📋 Copy Credentials'; }, 2000);
    }

    function trackFromSubmission() {
      if (!currentCreatedCreds) return;
      switchTab('track');
      document.getElementById('track-id-input').value = currentCreatedCreds.trackingId;
      document.getElementById('track-key-input').value = currentCreatedCreds.trackingKey;
      handleTrackReport(new Event('submit'));
    }

    // Handle Report Tracking
    async function handleTrackReport(e) {
      if (e && e.preventDefault) e.preventDefault();
      const trackingId = document.getElementById('track-id-input').value.trim();
      const trackingKey = document.getElementById('track-key-input').value.trim();
      const container = document.getElementById('track-details-container');

      if (!trackingId) return;

      try {
        const res = await fetch(\`/api/reports/track/\${encodeURIComponent(trackingId)}?key=\${encodeURIComponent(trackingKey)}\`);
        const data = await res.json();

        if (!res.ok) {
          alert('Track Error: ' + (data.message || data.error));
          container.style.display = 'none';
          return;
        }

        const r = data.report;
        container.style.display = 'block';
        document.getElementById('track-display-id').textContent = r.trackingId;
        
        const catBadge = document.getElementById('track-display-cat');
        catBadge.textContent = r.category;
        catBadge.className = 'tag tag-' + r.category;

        const statusContainer = document.getElementById('track-display-status');
        statusContainer.innerHTML = \`<span class="status-badge status-\${r.status}">\${r.statusLabel}</span>\`;

        document.getElementById('track-display-dates').textContent = 'Submitted: ' + new Date(r.createdAt).toLocaleString() + ' • Last updated: ' + new Date(r.updatedAt).toLocaleString();
        document.getElementById('track-display-desc').textContent = r.description;

        const evDiv = document.getElementById('track-display-evidence');
        if (r.evidenceUrl) {
          evDiv.innerHTML = \`<strong style="color:var(--text-muted)">Evidence Link:</strong> <a href="\${r.evidenceUrl}" target="_blank" rel="noopener noreferrer" style="color:var(--primary); text-decoration: underline;">\${r.evidenceUrl}</a>\`;
        } else {
          evDiv.innerHTML = '<span style="color:var(--text-muted); font-size: 12px;">No external evidence link attached.</span>';
        }

        // Render timeline
        const timeline = document.getElementById('track-timeline');
        timeline.innerHTML = (r.timeline || []).map(item => \`
          <div class="timeline-item">
            <div class="timeline-point"></div>
            <div class="timeline-header">
              <span style="color:#fff; font-weight: 600;">\${item.author}</span>
              <span>• \${new Date(item.createdAt).toLocaleString()}</span>
            </div>
            <div class="timeline-content">
              <div>\${item.text}</div>
              \${item.evidenceUrl ? \`<div style="margin-top:6px; font-size:12px;"><a href="\${item.evidenceUrl}" target="_blank" style="color:var(--primary);">Attached Evidence ↗</a></div>\` : ''}
            </div>
          </div>
        \`).join('');

      } catch (err) {
        alert('Failed to track report: ' + err.message);
      }
    }

    // Follow-up submission by reporter
    async function handleFollowupSubmit(e) {
      e.preventDefault();
      const trackingId = document.getElementById('track-id-input').value.trim();
      const trackingKey = document.getElementById('track-key-input').value.trim();
      const message = document.getElementById('followup-message').value.trim();
      const evidenceUrl = document.getElementById('followup-evidence').value.trim();

      try {
        const res = await fetch(\`/api/reports/track/\${encodeURIComponent(trackingId)}/messages\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trackingKey, message, evidenceUrl })
        });
        const data = await res.json();
        if (res.ok) {
          document.getElementById('followup-message').value = '';
          document.getElementById('followup-evidence').value = '';
          handleTrackReport(new Event('submit'));
        } else {
          alert('Error: ' + (data.message || data.error));
        }
      } catch (err) {
        alert('Failed to send follow-up: ' + err.message);
      }
    }

    // Moderator: Load Stats
    async function loadModeratorStats() {
      try {
        const res = await fetch('/api/moderator/stats');
        const data = await res.json();
        const s = data.stats;
        document.getElementById('stat-total').textContent = s.totalReports;
        document.getElementById('stat-pending').textContent = s.pendingCount;
        document.getElementById('stat-investigating').textContent = s.activeInvestigations;
        document.getElementById('stat-resolved').textContent = s.resolvedCount;
      } catch (e) {
        console.error('Error fetching stats:', e);
      }
    }

    // Moderator: Load Reports Table
    async function loadModeratorReports() {
      const category = document.getElementById('mod-filter-category').value;
      const status = document.getElementById('mod-filter-status').value;
      const search = document.getElementById('mod-search').value;

      let url = '/api/moderator/reports?';
      if (category) url += 'category=' + encodeURIComponent(category) + '&';
      if (status) url += 'status=' + encodeURIComponent(status) + '&';
      if (search) url += 'search=' + encodeURIComponent(search);

      try {
        const res = await fetch(url);
        const data = await res.json();
        const body = document.getElementById('mod-reports-body');

        if (!data.reports || data.reports.length === 0) {
          body.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--text-muted);">No reports match the selected filters.</td></tr>';
          return;
        }

        body.innerHTML = data.reports.map(r => \`
          <tr>
            <td class="mono" style="font-weight: 600; color: #fff;">\${r.trackingId}</td>
            <td><span class="tag tag-\${r.category}">\${r.category}</span></td>
            <td><span style="font-size: 12px; font-weight: 700; color: \${r.priority === 'CRITICAL' ? '#ef4444' : r.priority === 'HIGH' ? '#f59e0b' : '#9ca3af'};">\${r.priority}</span></td>
            <td style="max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #d1d5db;">\${r.description}</td>
            <td><span class="status-badge status-\${r.status}">\${r.status}</span></td>
            <td style="font-size: 12px; color: var(--text-muted);">\${new Date(r.createdAt).toLocaleDateString()}</td>
            <td>
              <button class="btn btn-secondary btn-sm" onclick="openModDetail('\${r.id}')">Manage</button>
            </td>
          </tr>
        \`).join('');
      } catch (e) {
        console.error('Error loading moderator reports:', e);
      }
    }

    let activeReport = null;

    async function openModDetail(id) {
      try {
        const res = await fetch('/api/moderator/reports/' + id);
        const data = await res.json();
        activeReport = data.report;

        const modal = document.getElementById('mod-modal');
        const title = document.getElementById('mod-modal-title');
        const body = document.getElementById('mod-modal-body');

        title.innerHTML = \`Case File: \${activeReport.trackingId} <span class="tag tag-\${activeReport.category}">\${activeReport.category}</span>\`;

        body.innerHTML = \`
          <div style="margin-bottom: 20px;">
            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">REPORT DETAILS</div>
            <div style="background: var(--code-bg); padding: 14px; border-radius: 8px; font-size: 13px; color: #f3f4f6; white-space: pre-wrap;">\${activeReport.description}</div>
            \${activeReport.evidenceUrl ? \`<div style="margin-top: 8px; font-size: 13px;"><strong style="color: var(--text-muted);">Attached Evidence:</strong> <a href="\${activeReport.evidenceUrl}" target="_blank" style="color: var(--primary);">\${activeReport.evidenceUrl}</a></div>\` : ''}
          </div>

          <div style="background: var(--card-subtle); padding: 16px; border-radius: 8px; margin-bottom: 20px;">
            <div style="font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 12px;">Update Investigation Status</div>
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 12px; margin-bottom: 12px;">
              <div>
                <label>Status</label>
                <select id="mod-update-status">
                  <option value="SUBMITTED" \${activeReport.status === 'SUBMITTED' ? 'selected' : ''}>Submitted</option>
                  <option value="UNDER_INVESTIGATION" \${activeReport.status === 'UNDER_INVESTIGATION' ? 'selected' : ''}>Under Investigation</option>
                  <option value="ACTION_TAKEN" \${activeReport.status === 'ACTION_TAKEN' ? 'selected' : ''}>Action Taken</option>
                  <option value="RESOLVED" \${activeReport.status === 'RESOLVED' ? 'selected' : ''}>Resolved</option>
                  <option value="DISMISSED" \${activeReport.status === 'DISMISSED' ? 'selected' : ''}>Dismissed</option>
                </select>
              </div>
              <div>
                <label>Public Message to Reporter (Visible on their track page)</label>
                <input type="text" id="mod-update-public-msg" placeholder="e.g. Investigation underway with legal department.">
              </div>
            </div>
            <div style="margin-bottom: 12px;">
              <label>Internal Audit Note (Confidential to Moderators Only)</label>
              <input type="text" id="mod-update-internal-note" placeholder="e.g. Interviewed witness X; verified server access logs.">
            </div>
            <button class="btn btn-sm" onclick="saveModStatus('\${activeReport.id}')">Apply Status Update</button>
          </div>

          <div>
            <div style="font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 10px;">Full Audit Timeline (Public + Internal)</div>
            <div class="timeline">
              \${(activeReport.timeline || []).map(t => \`
                <div class="timeline-item">
                  <div class="timeline-point" style="\${!t.isPublic ? 'background: #ef4444;' : ''}"></div>
                  <div class="timeline-header">
                    <span style="color: #fff; font-weight: 600;">\${t.author}</span>
                    <span>• \${new Date(t.createdAt).toLocaleString()}</span>
                    \${!t.isPublic ? '<span class="tag" style="background: rgba(239, 68, 68, 0.2); color: #f87171;">INTERNAL ONLY</span>' : '<span class="tag" style="background: rgba(16, 185, 129, 0.2); color: #34d399;">PUBLIC</span>'}
                  </div>
                  <div class="timeline-content \${!t.isPublic ? 'timeline-internal' : ''}">
                    <div>\${t.text}</div>
                    \${t.evidenceUrl ? \`<div style="margin-top:6px; font-size:12px;"><a href="\${t.evidenceUrl}" target="_blank" style="color:var(--primary);">Evidence link ↗</a></div>\` : ''}
                  </div>
                </div>
              \`).join('')}
            </div>
          </div>
        \`;

        modal.style.display = 'flex';
      } catch (err) {
        alert('Failed to load report: ' + err.message);
      }
    }

    function closeModModal() {
      document.getElementById('mod-modal').style.display = 'none';
    }

    async function saveModStatus(id) {
      const status = document.getElementById('mod-update-status').value;
      const publicMessage = document.getElementById('mod-update-public-msg').value.trim();
      const internalNote = document.getElementById('mod-update-internal-note').value.trim();

      try {
        const res = await fetch(\`/api/moderator/reports/\${id}/status\`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, publicMessage, internalNote })
        });
        const data = await res.json();
        if (res.ok) {
          alert('Status updated successfully!');
          openModDetail(id);
          loadModeratorReports();
          loadModeratorStats();
        } else {
          alert('Error: ' + (data.message || data.error));
        }
      } catch (e) {
        alert('Failed to update status: ' + e.message);
      }
    }

    // Live API Test Helpers
    async function testApiSubmit() {
      const box = document.getElementById('resp-api-submit');
      box.style.display = 'block';
      box.innerHTML = '<pre>Executing POST /api/reports...</pre>';
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'Security',
          description: 'API automated verification report test payload.',
          priority: 'HIGH'
        })
      });
      const data = await res.json();
      box.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
    }

    async function testApiTrack() {
      const box = document.getElementById('resp-api-track');
      box.style.display = 'block';
      box.innerHTML = '<pre>Executing GET /api/reports/track/WD-SEC-8921...</pre>';
      // For demo report, we can fetch from moderator list or use public query
      const res = await fetch('/api/moderator/reports?search=WD-SEC-8921');
      const modData = await res.json();
      if (modData.reports && modData.reports[0]) {
        const key = modData.reports[0].trackingKey;
        const trackRes = await fetch(\`/api/reports/track/WD-SEC-8921?key=\${key}\`);
        const data = await trackRes.json();
        box.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
      } else {
        box.innerHTML = '<pre>Demo report not found in storage.</pre>';
      }
    }

    async function testApiStats() {
      const box = document.getElementById('resp-api-stats');
      box.style.display = 'block';
      box.innerHTML = '<pre>Executing GET /api/moderator/stats...</pre>';
      const res = await fetch('/api/moderator/stats');
      const data = await res.json();
      box.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
    }

    // Initialize
    loadCategories();
  </script>
</body>
</html>`);
});

app.listen(PORT, HOST, () => {
  console.log(`WhistleDrop backend server running at http://${HOST}:${PORT}`);
});
