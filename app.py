"""
app.py
------
Main Python Flask backend application for WhistleDrop.
Created for: Confidential Anonymous Reporting System.
Suitable for a 1st year computer science student project.
"""

from flask import Flask, render_template, request, jsonify
import database

# Initialize the Flask application
app = Flask(__name__)

# Initialize our SQLite database on server startup
database.init_db()


# -------------------------------------------------------------
# 1. Frontend Route
# -------------------------------------------------------------
@app.route("/")
def home():
    """
    Renders the main single-page web interface.
    Contains: Submit Report, Track Report, and Moderator Dashboard.
    """
    return render_template("index.html")


# -------------------------------------------------------------
# 2. Anonymous Report Submission API
# -------------------------------------------------------------
@app.route("/api/reports", methods=["POST"])
def submit_report():
    """
    Task 1: Anonymous Reporting.
    Allows anyone to submit a report without an account or login.
    Expected JSON:
    - category: Security, Harassment, Corruption, Technical, Other
    - description: What happened
    - evidence_url: (optional link)
    Returns:
    - tracking_id: A unique code the user can use to check status later.
    """
    data = request.get_json()

    if not data:
        return jsonify({"success": False, "error": "No data provided in request"}), 400

    category = data.get("category", "").strip()
    description = data.get("description", "").strip()
    evidence_url = data.get("evidence_url", "").strip()

    # Simple validations (1st year student style)
    if category not in database.CATEGORIES:
        return jsonify({
            "success": False,
            "error": f"Invalid category. Must be one of: {', '.join(database.CATEGORIES)}"
        }), 400

    if len(description) < 10:
        return jsonify({
            "success": False,
            "error": "Description is too short. Please provide at least 10 characters."
        }), 400

    # Save to SQLite database
    tracking_id = database.create_report(category, description, evidence_url)

    return jsonify({
        "success": True,
        "message": "Report successfully submitted anonymously.",
        "tracking_id": tracking_id
    }), 201


# -------------------------------------------------------------
# 3. Track Report Progress API
# -------------------------------------------------------------
@app.route("/api/reports/<tracking_id>", methods=["GET"])
def track_report(tracking_id):
    """
    Allows the whistleblower to track their report using only their Tracking ID.
    No login or identity is required or checked.
    """
    report = database.get_report_by_tracking_id(tracking_id)

    if not report:
        return jsonify({
            "success": False,
            "error": "Report not found. Please check your Tracking ID."
        }), 404

    # Convert sqlite3.Row object to regular Python dictionary
    report_dict = {
        "id": report["id"],
        "tracking_id": report["tracking_id"],
        "category": report["category"],
        "description": report["description"],
        "evidence_url": report["evidence_url"],
        "status": report["status"],
        "moderator_note": report["moderator_note"],
        "created_at": report["created_at"]
    }

    return jsonify({
        "success": True,
        "report": report_dict
    }), 200


# -------------------------------------------------------------
# 4. Moderator Review & Management APIs
# -------------------------------------------------------------
@app.route("/api/moderator/reports", methods=["GET"])
def get_all_reports():
    """
    Retrieves all reports for moderators to review.
    Supports simple query filters: ?category=Security&status=Submitted
    """
    category_filter = request.args.get("category")
    status_filter = request.args.get("status")

    reports = database.get_all_reports(category_filter, status_filter)
    stats = database.get_stats()

    # Convert rows to list of dicts
    reports_list = []
    for r in reports:
        reports_list.append({
            "id": r["id"],
            "tracking_id": r["tracking_id"],
            "category": r["category"],
            "description": r["description"],
            "evidence_url": r["evidence_url"],
            "status": r["status"],
            "moderator_note": r["moderator_note"],
            "created_at": r["created_at"]
        })

    return jsonify({
        "success": True,
        "count": len(reports_list),
        "stats": stats,
        "reports": reports_list
    }), 200


@app.route("/api/moderator/update/<int:report_id>", methods=["POST"])
def update_report(report_id):
    """
    Allows moderators to update the status and add remarks/notes for a report.
    """
    data = request.get_json()

    if not data:
        return jsonify({"success": False, "error": "No data received"}), 400

    new_status = data.get("status")
    moderator_note = data.get("moderator_note", "").strip()

    if new_status not in database.STATUSES:
        return jsonify({
            "success": False,
            "error": f"Status must be one of: {', '.join(database.STATUSES)}"
        }), 400

    database.update_report_status(report_id, new_status, moderator_note)

    return jsonify({
        "success": True,
        "message": f"Report #{report_id} updated to status '{new_status}'."
    }), 200


# -------------------------------------------------------------
# 5. Health Check API
# -------------------------------------------------------------
@app.route("/api/health", methods=["GET"])
def health_check():
    """Simple health endpoint to verify backend is up."""
    return jsonify({
        "status": "online",
        "language": "Python 3.10",
        "framework": "Flask",
        "database": "SQLite3"
    }), 200


# -------------------------------------------------------------
# Server Entry Point
# -------------------------------------------------------------
if __name__ == "__main__":
    # In AI Studio, the dev server must run on port 3000 and bind to 0.0.0.0
    print("Starting WhistleDrop Python Backend on http://0.0.0.0:3000...")
    app.run(host="0.0.0.0", port=3000, debug=True)
