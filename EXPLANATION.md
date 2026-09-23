# WhistleDrop — Speak Without Being Seen
## 1st Year Python Backend Project Documentation & Viva Guide

**Project Title:** WhistleDrop — Confidential Anonymous Reporting System  
**Programming Language:** Python 3  
**Framework:** Flask (Lightweight Python Web Framework)  
**Database:** SQLite3 (Python's Built-in Relational Database)  
**Frontend:** Basic HTML & CSS (Backend-focused project)  

---

## 1. Project Objective (What is this project?)

In many colleges, workplaces, and organizations, people see things that are wrong (such as harassment, security issues, corruption, or cheating), but they are scared to report them because they fear being punished or exposed.

**WhistleDrop** solves this problem by allowing anyone to submit a report **without creating an account, giving their name, or logging in**.
Instead of asking for a username or email:
1. The user picks a **Category** (Security, Harassment, Corruption, Technical, Other).
2. The user writes a **Description** of what happened.
3. The user can optionally attach an **Evidence URL**.
4. The system automatically generates a unique **Tracking ID** (for example: `WD-89A4C`).
5. The reporter saves this Tracking ID and can enter it anytime to check if a moderator has reviewed their report, changed its status, or replied with an update.
6. Moderators have a dashboard where they can see all submitted reports, filter them, update their status, and add remarks.

---

## 2. Why Did We Use Python, Flask & SQLite?

As a 1st-year computer science student, these technologies are the best choices:

1. **Python 3:** Very clean, readable syntax that is easy to understand, debug, and explain to teachers or viva examiners.
2. **Flask:** Unlike heavy frameworks like Django, Flask is a "micro-framework". It gives us full control over our backend routes (`@app.route`) without any complicated setup.
3. **SQLite3:** SQLite is built right into Python (`import sqlite3`). We don't need to install or configure separate database servers like MySQL or PostgreSQL. Everything is saved inside a single file named `whistledrop.db`.
4. **Basic HTML & CSS Frontend:** Since the assignment is **backend focused**, we kept the frontend simple, clean, and lightweight without confusing build tools or complex JavaScript frameworks.

---

## 3. Project Structure

Here is how the project files are organized:

```text
├── app.py                 # The main Flask backend server with all routes
├── database.py            # Database functions (create table, insert, search, update)
├── whistledrop.db         # SQLite database file storing all reports
├── requirements.txt       # Python libraries needed (Flask)
├── templates/
│   └── index.html         # Basic HTML frontend with Submit, Track, and Moderator tabs
├── EXPLANATION.md         # This documentation guide
└── package.json           # Dev server startup script for the environment
```

---

## 4. Database Schema (How Data is Stored)

We created an SQLite table called `reports`. Here is the structure:

| Column Name | Data Type | Purpose |
|---|---|---|
| `id` | INTEGER PRIMARY KEY AUTOINCREMENT | Unique serial number for each report (1, 2, 3...) |
| `tracking_id` | TEXT UNIQUE | The secret code given to the reporter (e.g. `WD-SEC101`) |
| `category` | TEXT | Category: Security, Harassment, Corruption, Technical, or Other |
| `description` | TEXT | Details of what occurred |
| `evidence_url` | TEXT | Optional link to supporting evidence |
| `status` | TEXT | Current state: Submitted, Under Investigation, Resolved, Dismissed |
| `moderator_note` | TEXT | Notes, remarks, or reply added by the moderator |
| `created_at` | TEXT | Date and time when the report was submitted |

---

## 5. What I Did Step-by-Step in Building This Project

### Step 1: Database Setup (`database.py`)
- Created a function `init_db()` that uses SQL `CREATE TABLE IF NOT EXISTS reports (...)` so the database is automatically created whenever the server starts.
- Added 2 sample reports in `init_db()` so the moderator table is not completely empty on first launch.
- Created `generate_tracking_id()` which randomly picks 6 capital letters/digits and adds `WD-` in front (e.g. `WD-A7B2X9`).
- Created helper functions:
  - `create_report()` to insert a new row.
  - `get_report_by_tracking_id()` to search for a report using its tracking code.
  - `get_all_reports()` with category and status filters for moderators.
  - `update_report_status()` to let moderators update status and add notes.

### Step 2: Building Backend API Routes (`app.py`)
Using Flask decorators, we wrote 5 core backend endpoints:
1. `GET /` — Renders the frontend user interface (`index.html`).
2. `POST /api/reports` — Receives JSON data, validates category and description length, saves it to SQLite, and returns the generated `tracking_id`.
3. `GET /api/reports/<tracking_id>` — Allows the reporter to look up their report's progress using only their tracking code.
4. `GET /api/moderator/reports` — Returns all reports in the system for the moderator view, along with quick statistics (total count, pending count, etc.).
5. `POST /api/moderator/update/<id>` — Allows moderators to change the status (e.g., to "Under Investigation" or "Resolved") and write remarks.

### Step 3: Building the Basic Frontend (`templates/index.html`)
- Built a straightforward, responsive single-page design with 4 tabs:
  1. **Submit Report**: Simple form with category dropdown, description box, optional evidence URL, and submit button. When submitted, it displays the private Tracking ID with a button to copy it.
  2. **Track My Report**: Search box where the user pastes their Tracking ID to see their status with color-coded badges and moderator remarks.
  3. **Moderator View**: Table of all submissions, filter dropdowns, and an inline status updater with save button.
  4. **Backend API Info**: Summary of the backend endpoints.

---

## 6. How Privacy and Anonymity are Protected

1. **No User Registration or Accounts:**
   - The user never enters a name, email address, password, or student ID.
2. **Independent Tracking ID:**
   - The user is identified only by a randomly generated alphanumeric code (`WD-XXXXXX`).
3. **No Cookies or Sessions Storing User Identity:**
   - Anyone holding the Tracking ID can see the status, but nobody (not even the moderator) knows who submitted it.

---

## 7. How to Run and Test the Project

### To Run Locally:
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the server:
   ```bash
   python3 app.py
   ```
3. Open your browser and go to:
   ```text
   http://localhost:3000
   ```

### Testing with `curl` (Command Line):

1. **Submit an anonymous report:**
   ```bash
   curl -X POST http://localhost:3000/api/reports \
     -H "Content-Type: application/json" \
     -d '{
       "category": "Corruption",
       "description": "Unauthorized alteration of college exam scoring records in the registrar database.",
       "evidence_url": "https://example.com/logs"
     }'
   ```
   *Response:*
   ```json
   {
     "success": true,
     "message": "Report successfully submitted anonymously.",
     "tracking_id": "WD-YA6AFI"
   }
   ```

2. **Track the report:**
   ```bash
   curl http://localhost:3000/api/reports/WD-YA6AFI
   ```

3. **Update status as moderator:**
   ```bash
   curl -X POST http://localhost:3000/api/moderator/update/1 \
     -H "Content-Type: application/json" \
     -d '{
       "status": "Resolved",
       "moderator_note": "Issue investigated and fixed."
     }'
   ```

---

## 8. Common 1st Year Viva / Interview Questions & Answers

**Q1: What is the difference between GET and POST requests in your project?**  
*Answer:* We use `POST` when sending data to be stored on the server (like when submitting a report or updating a status). We use `GET` when we are only reading or requesting data from the server (like loading the home page, fetching report status, or retrieving the moderator list).

**Q2: How does the system remember reports if the server restarts?**  
*Answer:* We use an SQLite database stored in `whistledrop.db`. Whenever a report is submitted, an SQL `INSERT` statement permanently writes the data into the database table on disk.

**Q3: How does the reporter check the status of their report without logging in?**  
*Answer:* When a report is created, our backend generates a unique random Tracking ID (like `WD-YA6AFI`). The reporter saves this code. Later, they enter it into the "Track My Report" page, which sends a `GET /api/reports/<tracking_id>` request to fetch only that report's details.

**Q4: Why did you choose SQLite over MySQL?**  
*Answer:* SQLite is serverless, zero-configuration, and integrated directly into Python's standard library (`sqlite3`). For a prototype/1st-year project, it is fast, portable, and requires no external database server installation.
