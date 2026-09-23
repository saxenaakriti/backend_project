import express from 'express';
import { ReportStore, VALID_CATEGORIES, VALID_STATUSES } from '../store.js';

const router = express.Router();

/**
 * GET /api/moderator/reports
 * Query all reports with optional filtering
 */
router.get('/reports', (req, res) => {
  const { category, status, search, priority } = req.query;
  let reports = ReportStore.getAll();

  if (category && VALID_CATEGORIES.includes(category)) {
    reports = reports.filter(r => r.category === category);
  }

  if (status && VALID_STATUSES.includes(status)) {
    reports = reports.filter(r => r.status === status);
  }

  if (priority && ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(priority)) {
    reports = reports.filter(r => r.priority === priority);
  }

  if (search && typeof search === 'string') {
    const term = search.toLowerCase();
    reports = reports.filter(r =>
      r.trackingId.toLowerCase().includes(term) ||
      r.description.toLowerCase().includes(term) ||
      r.category.toLowerCase().includes(term)
    );
  }

  return res.json({
    count: reports.length,
    reports
  });
});

/**
 * GET /api/moderator/reports/:id
 * Retrieve full report details including internal notes
 */
router.get('/reports/:id', (req, res) => {
  const { id } = req.params;
  const report = ReportStore.getById(id);

  if (!report) {
    return res.status(404).json({
      error: 'Report not found',
      message: `No report found with ID: ${id}`
    });
  }

  return res.json({
    report
  });
});

/**
 * PATCH /api/moderator/reports/:id/status
 * Update report investigation status
 */
router.patch('/reports/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, publicMessage, internalNote } = req.body;

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: 'Invalid status',
      message: `Status must be one of: ${VALID_STATUSES.join(', ')}`
    });
  }

  const updated = ReportStore.updateStatus(id, status, publicMessage, internalNote);

  if (!updated) {
    return res.status(404).json({
      error: 'Report not found'
    });
  }

  return res.json({
    success: true,
    message: `Report status updated to ${status}.`,
    report: updated
  });
});

/**
 * POST /api/moderator/reports/:id/notes
 * Add internal or public note to report
 */
router.post('/reports/:id/notes', (req, res) => {
  const { id } = req.params;
  const { note, isPublic } = req.body;

  if (!note || typeof note !== 'string' || note.trim().length === 0) {
    return res.status(400).json({
      error: 'Note required',
      message: 'Note content cannot be empty.'
    });
  }

  const updated = ReportStore.addModeratorNote(id, note.trim(), isPublic);

  if (!updated) {
    return res.status(404).json({
      error: 'Report not found'
    });
  }

  return res.json({
    success: true,
    message: isPublic ? 'Public update published to reporter.' : 'Internal moderator note saved.',
    report: updated
  });
});

/**
 * GET /api/moderator/stats
 * Aggregated reporting statistics
 */
router.get('/stats', (req, res) => {
  const stats = ReportStore.getStats();
  return res.json({
    stats
  });
});

export default router;
