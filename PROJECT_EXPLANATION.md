# WhistleDrop — Speak Without Being Seen
### Comprehensive Backend Project & Architectural Documentation

---

## 1. Project Overview & Motivation

**WhistleDrop** is a confidential, zero-knowledge reporting backend designed for organizations where employees, contractors, or whistleblowers need to report sensitive issues without fear of retaliation or identity exposure.

### Problem Statement
Traditional reporting channels (such as internal ticketing systems, HR emails, or corporate forms) require employee authentication, login accounts, or capture network telemetry (IP addresses, user agents, email headers). This creates high barrier-to-entry and psychological risk for whistleblowers, leading to unreported misconduct, security breaches, harassment, and corruption.

### Solution
WhistleDrop allows anyone to submit an incident report **without creating an account, entering an email, or revealing their identity**. In exchange, the system gives the reporter an unguessable **Tracking ID** and **Cryptographic Secret Key**. Using these credentials, the reporter can monitor the investigation's progress and participate in an anonymous two-way dialogue with investigators.

---

## 2. What Was Done in Making the Project

Here is a step-by-step breakdown of how the WhistleDrop backend was built:

### A. Core Architecture Design
1. **Modular Node.js Express Backend (`server.js`, `src/`)**:
   - `server.js`: Server bootstrap, middleware pipeline, network anonymity sanitization, and mounted routers.
   - `src/store.js`: Data persistence layer with JSON file storage (`data/reports.json`), pre-seeded demonstration records, cryptographic ID generation, and query/update functions.
   - `src/routes/reports.js`: Public-facing anonymous reporting and tracking routes.
   - `src/routes/moderator.js`: Authorized triage, case management, note-taking, and metrics routes.
2. **Local Persistence Engine**:
   - Stores reports and timelines in a structured `data/reports.json` file so submissions persist across server restarts.
   - Automatic seeding of sample realistic cases (`Security`, `Corruption`) on initial initialization for immediate testing.

### B. Anonymity & Privacy Protections
1. **Zero Account Dependency**:
   - No user table, passwords, or emails.
   - Anyone can submit a report instantly.
2. **Network Telemetry Stripping**:
   - Middleware strips incoming `X-Forwarded-For` and client socket IP addresses to prevent accidental logging or leakage.
3. **Dual-Key Access Model**:
   - **Public Tracking ID** (e.g., `WD-SEC-8921`): Identifies the case file.
   - **Secret Tracking Key** (32-character hexadecimal key): Acts as the sole bearer credential for the reporter to view their case and append follow-up messages.
4. **Air-Gapped Notes**:
   - The timeline distinguishes between `PUBLIC` milestones (visible to the reporter) and `INTERNAL_ONLY` notes (visible exclusively to investigators/moderators). Internal deliberations are automatically filtered out when reporters check their case.

### C. Category & Data Modeling
WhistleDrop categorizes incidents according to the user specification:
- **Security**: Data leaks, credential compromises, cyber breaches, unauthorized access.
- **Harassment**: Hostile workplace environments, harassment, discrimination, retaliation.
- **Corruption**: Bribery, procurement rigging, fraud, embezzlement, conflict of interest.
- **Technical**: Safety violations, test falsification, deliberate compliance bypasses.
- **Other**: Any other serious organizational or ethical violations.

### D. Investigation Lifecycle & Statuses
Cases progress through 5 strict lifecycle states:
1. `SUBMITTED`: Report recorded and awaiting triage.
2. `UNDER_INVESTIGATION`: Assigned to investigators; active inquiry underway.
3. `ACTION_TAKEN`: Corrective or preventative remediation deployed.
4. `RESOLVED`: Final case resolution confirmed.
5. `DISMISSED`: Closed without action (duplicate, unsubstantiated, or out of scope).

### E. Interactive Web Console
To test and demonstrate all backend capabilities, an interactive web application is served at `/`, providing:
- **Anonymous Submission Form**: Live validation, category selector, urgency/priority flag, evidence URL input, and 1-click credential copying.
- **Report Tracker**: Live query tool by Tracking ID + Key, showing status pills, incident details, and public timeline, with an anonymous reply form for follow-ups.
- **Moderator Portal**: Case registry with category/status filters, keyword search, status transition dialog, and dual public/internal note authoring.
- **API Explorer**: Ready-to-copy `curl` commands and live API execution buttons.

---

## 3. Project File Structure

```text
/
├── package.json              # Project dependencies (Express) and npm scripts
├── metadata.json             # Application metadata and runtime declarations
├── .env.example              # Environment variable declaration (PORT=3000)
├── server.js                 # Express server, anonymity middleware, and UI console
├── PROJECT_EXPLANATION.md    # This comprehensive project documentation file
├── demo.txt                  # Original imported GitHub repository artifact
├── data/
│   └── reports.json          # Persistent report storage database
└── src/
    ├── store.js              # Persistence manager & cryptographic ID generator
    └── routes/
        ├── reports.js        # Public report submission & anonymous tracking routes
        └── moderator.js      # Moderator review, status updates, notes, and stats routes
```

---

## 4. REST API Specification

### 1. Anonymous Report Submission
- **Method**: `POST`
- **Endpoint**: `/api/reports`
- **Request Body**:
  ```json
  {
    "category": "Security",
    "description": "Unprotected AWS credentials found committed to a public GitHub repository.",
    "evidenceUrl": "https://pastebin.com/raw/sample-redacted-leak",
    "priority": "HIGH"
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Report submitted successfully and encrypted anonymously.",
    "trackingId": "WD-SEC-8921",
    "trackingKey": "8a3f7c4192b0e6d5a1c4b78901234567",
    "instructions": {
      "notice": "Save your Tracking ID and Tracking Key. They are the only way to track progress...",
      "trackUrl": "/api/reports/track/WD-SEC-8921?key=8a3f7c4192b0e6d5a1c4b78901234567"
    },
    "report": { ... }
  }
  ```

### 2. Track Report Progress
- **Method**: `GET`
- **Endpoint**: `/api/reports/track/:trackingId?key=:trackingKey`
- **Headers (Alternative)**: `x-tracking-key: <key>`
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "report": {
      "trackingId": "WD-SEC-8921",
      "category": "Security",
      "description": "...",
      "status": "UNDER_INVESTIGATION",
      "statusLabel": "Under Active Investigation",
      "createdAt": "2026-09-20T12:00:00.000Z",
      "updatedAt": "2026-09-21T08:30:00.000Z",
      "timeline": [
        {
          "id": "...",
          "type": "STATUS_CHANGE",
          "text": "Status updated to Under Active Investigation by SecOps triage.",
          "author": "Moderator",
          "createdAt": "..."
        }
      ]
    }
  }
  ```
  *(Note: Any internal investigator notes are strictly excluded from this payload).*

### 3. Anonymous Follow-Up Message
- **Method**: `POST`
- **Endpoint**: `/api/reports/track/:trackingId/messages`
- **Request Body**:
  ```json
  {
    "trackingKey": "8a3f7c4192b0e6d5a1c4b78901234567",
    "message": "Here is additional evidence confirming the repository commit hash.",
    "evidenceUrl": "https://pastebin.com/raw/commit-proof"
  }
  ```

### 4. Moderator: List & Filter Reports
- **Method**: `GET`
- **Endpoint**: `/api/moderator/reports`
- **Query Parameters**:
  - `category`: `Security` | `Harassment` | `Corruption` | `Technical` | `Other`
  - `status`: `SUBMITTED` | `UNDER_INVESTIGATION` | `ACTION_TAKEN` | `RESOLVED` | `DISMISSED`
  - `priority`: `LOW` | `MEDIUM` | `HIGH` | `CRITICAL`
  - `search`: Keyword search in tracking ID or description

### 5. Moderator: Update Report Status
- **Method**: `PATCH`
- **Endpoint**: `/api/moderator/reports/:id/status`
- **Request Body**:
  ```json
  {
    "status": "ACTION_TAKEN",
    "publicMessage": "Compromised credentials have been revoked and all active sessions terminated.",
    "internalNote": "HR and Legal notified; incident report filed as INC-9021."
  }
  ```

### 6. Moderator: Metrics & Analytics
- **Method**: `GET`
- **Endpoint**: `/api/moderator/stats`
- **Response**:
  ```json
  {
    "stats": {
      "totalReports": 5,
      "pendingCount": 1,
      "activeInvestigations": 2,
      "resolvedCount": 2,
      "byCategory": {
        "Security": 2,
        "Harassment": 1,
        "Corruption": 1,
        "Technical": 1,
        "Other": 0
      },
      "byStatus": { ... }
    }
  }
  ```

---

## 5. Security & Anonymity Guarantees

| Concern | WhistleDrop Implementation |
|---|---|
| **Identity / Account** | Zero registration. No username, email, phone number, or password required. |
| **Network IP Tracking** | Ingress middleware strips `x-forwarded-for` and remote client addresses before logging or storing. |
| **Tracking Security** | Cryptographic 128-bit hexadecimal keys (`crypto.randomBytes(16)`) prevent enumeration or brute-force snooping. |
| **Investigation Privacy** | Internal notes (`isPublic: false`) are air-gapped on the server side and never sent to public tracking clients. |
| **Evidence Safety** | URLs are validated and handled as reference pointers rather than executable attachments. |

---

## 6. How to Run and Test

### Starting the Server
```bash
npm run dev
# Or for production:
npm start
```
The server listens on `http://0.0.0.0:3000`.

### Verifying with `curl`

1. **Submit an anonymous report**:
   ```bash
   curl -X POST http://localhost:3000/api/reports \
     -H "Content-Type: application/json" \
     -d '{
       "category": "Harassment",
       "description": "Retaliatory exclusion following safety compliance audit.",
       "priority": "HIGH"
     }'
   ```

2. **Track with returned credentials**:
   ```bash
   curl "http://localhost:3000/api/reports/track/WD-HAR-XXXX?key=YOUR_KEY"
   ```

3. **Check System Stats**:
   ```bash
   curl http://localhost:3000/api/moderator/stats
   ```
