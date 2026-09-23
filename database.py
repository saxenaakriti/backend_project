"""
database.py
-----------
This file handles all SQLite database operations for WhistleDrop.
We use Python's built-in 'sqlite3' module so we don't need any complex external database.

Table: reports
Fields:
- id: Primary Key (auto-increment integer)
- tracking_id: Unique string code given to user (e.g., WD-7B3F9A)
- category: Security, Harassment, Corruption, Technical, or Other
- description: Text explanation of the incident
- evidence_url: Optional link to evidence (e.g. drive or document link)
- status: Submitted, Under Investigation, Resolved, or Dismissed
- moderator_note: Remarks or feedback added by the moderator
- created_at: Timestamp when the report was submitted
"""

import sqlite3
import random
import string
from datetime import datetime

DB_NAME = "whistledrop.db"

# Valid categories as specified in the problem statement
CATEGORIES = ["Security", "Harassment", "Corruption", "Technical", "Other"]

# Valid statuses for tracking progress
STATUSES = ["Submitted", "Under Investigation", "Resolved", "Dismissed"]


def get_db_connection():
    """Helper function to open a connection to the SQLite database."""
    conn = sqlite3.connect(DB_NAME)
    # This allows us to access columns by name like a Python dictionary
    conn.row_factory = sqlite3.Row
    return conn


def generate_tracking_id():
    """
    Generates a unique tracking code for the anonymous reporter.
    Example output: WD-89A4C
    This allows the user to check their report later without an account.
    """
    random_chars = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"WD-{random_chars}"


def init_db():
    """
    Creates the database table if it does not already exist.
    Also inserts 2 sample demo reports so the application isn't completely empty when first launched.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tracking_id TEXT UNIQUE NOT NULL,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            evidence_url TEXT,
            status TEXT NOT NULL DEFAULT 'Submitted',
            moderator_note TEXT DEFAULT '',
            created_at TEXT NOT NULL
        )
    """)

    # Check if table has any data, if not, insert sample data
    cursor.execute("SELECT COUNT(*) FROM reports")
    count = cursor.fetchone()[0]

    if count == 0:
        sample_reports = [
            (
                "WD-SEC101",
                "Security",
                "Found sensitive server database passwords left in an open public repository.",
                "https://example.com/pastebin-leak-demo",
                "Under Investigation",
                "SecOps team is rotating the affected credentials.",
                "2026-09-21 10:30:00"
            ),
            (
                "WD-COR202",
                "Corruption",
                "Vendor selection for office equipment had unauthorized bid tampering.",
                "https://example.com/bid-document-ref",
                "Submitted",
                "",
                "2026-09-22 14:15:00"
            )
        ]

        cursor.executemany("""
            INSERT INTO reports (tracking_id, category, description, evidence_url, status, moderator_note, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, sample_reports)

    conn.commit()
    conn.close()


def create_report(category, description, evidence_url=""):
    """
    Inserts a new anonymous report into the database.
    Returns the newly generated tracking ID.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    tracking_id = generate_tracking_id()
    created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""
        INSERT INTO reports (tracking_id, category, description, evidence_url, status, moderator_note, created_at)
        VALUES (?, ?, ?, ?, 'Submitted', '', ?)
    """, (tracking_id, category, description, evidence_url, created_at))

    conn.commit()
    conn.close()
    return tracking_id


def get_report_by_tracking_id(tracking_id):
    """
    Fetches a single report using the tracking ID provided by the user.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Make search case-insensitive and clean whitespace
    clean_id = tracking_id.strip().upper()

    cursor.execute("SELECT * FROM reports WHERE UPPER(tracking_id) = ?", (clean_id,))
    report = cursor.fetchone()
    conn.close()
    return report


def get_all_reports(category_filter=None, status_filter=None):
    """
    Fetches all reports for the moderator dashboard.
    Optionally filters by category and/or status.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM reports WHERE 1=1"
    params = []

    if category_filter and category_filter != "All":
        query += " AND category = ?"
        params.append(category_filter)

    if status_filter and status_filter != "All":
        query += " AND status = ?"
        params.append(status_filter)

    query += " ORDER BY id DESC"

    cursor.execute(query, params)
    reports = cursor.fetchall()
    conn.close()
    return reports


def update_report_status(report_id, new_status, moderator_note=""):
    """
    Updates the status and moderator note for a specific report.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE reports
        SET status = ?, moderator_note = ?
        WHERE id = ?
    """, (new_status, moderator_note, report_id))

    conn.commit()
    conn.close()


def get_stats():
    """
    Calculates summary counts for the dashboard.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM reports")
    total = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM reports WHERE status = 'Submitted'")
    submitted = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM reports WHERE status = 'Under Investigation'")
    investigating = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM reports WHERE status = 'Resolved'")
    resolved = cursor.fetchone()[0]

    conn.close()
    return {
        "total": total,
        "submitted": submitted,
        "investigating": investigating,
        "resolved": resolved
    }
