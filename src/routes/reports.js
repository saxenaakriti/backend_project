import express from 'express';
import { ReportStore, VALID_CATEGORIES, STATUS_LABELS } from '../store.js';

const router = express.Router();

// Helper to strip internal notes and sensitive keys from public view
function sanitizeReportForReporter(report) {
  if (!report) return null;
  return {
    trackingId: report.trackingId,
    category: report.category,
    description: report.description,
    evidenceUrl: report.evidenceUrl,
    status: report.status,
    statusLabel: STATUS_LABELS[report.status] || report.status,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
    // Only return public timeline items (hide internal investigator notes)
    timeline: (report.timeline || [])
      .filter(item => item.isPublic)
      .map(item => ({
        id: item.id,
        type: item.type,
        text: item.text,
        author: item.author,
        createdAt: item.createdAt,
        evidenceUrl: item.evidenceUrl || null
      }))
  };
}

/**
 * POST /api/reports
 * Submit a confidential anonymous report
 */
router.post('/reports', (req, res) => {
  const { category, description, evidenceUrl, priority } = req.body;

  // Validation
  if (!category || !VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({
      error: 'Invalid category',
      message: `Category must be one of: ${VALID_CATEGORIES.join(', ')}`
    });
  }

  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    return res.status(400).json({
      error: 'Invalid description',
      message: 'Description must be at least 10 characters long to provide sufficient detail.'
    });
  }

  // Validate URL format if provided
  if (evidenceUrl && typeof evidenceUrl === 'string' && evidenceUrl.trim() !== '') {
    try {
      new URL(evidenceUrl.trim());
    } catch {
      return res.status(400).json({
        error: 'Invalid evidence URL',
        message: 'Evidence URL must be a valid HTTP or HTTPS URL if provided.'
      });
    }
  }

  const newReport = ReportStore.create({
    category,
    description,
    evidenceUrl,
    priority
  });

  return res.status(201).json({
    success: true,
    message: 'Report submitted successfully and encrypted anonymously.',
    trackingId: newReport.trackingId,
    trackingKey: newReport.trackingKey,
    instructions: {
      notice: 'IMPORTANT: Save your Tracking ID and Tracking Key. They are the only way to track progress or provide further evidence without revealing your identity.',
      trackUrl: `/api/reports/track/${newReport.trackingId}?key=${newReport.trackingKey}`
    },
    report: sanitizeReportForReporter(newReport)
  });
});

/**
 * GET /api/reports/track/:trackingId
 * Anonymous tracking endpoint
 */
router.get('/reports/track/:trackingId', (req, res) => {
  const { trackingId } = req.params;
  const trackingKey = req.query.key || req.headers['x-tracking-key'];

  if (!trackingId) {
    return res.status(400).json({ error: 'Tracking ID is required' });
  }

  const result = ReportStore.getByTracking(trackingId, trackingKey);

  if (!result) {
    return res.status(404).json({
      error: 'Report not found',
      message: 'No report exists with the provided Tracking ID.'
    });
  }

  if (result.unauthorized) {
    return res.status(401).json({
      error: 'Invalid tracking key',
      message: 'The provided tracking key does not match this report.'
    });
  }

  return res.json({
    success: true,
    report: sanitizeReportForReporter(result)
  });
});

/**
 * POST /api/reports/track/:trackingId/messages
 * Add anonymous follow-up note / evidence
 */
router.post('/reports/track/:trackingId/messages', (req, res) => {
  const { trackingId } = req.params;
  const trackingKey = req.body.trackingKey || req.query.key || req.headers['x-tracking-key'];
  const { message, evidenceUrl } = req.body;

  if (!trackingKey) {
    return res.status(401).json({
      error: 'Tracking key required',
      message: 'A valid tracking key is required to update this report.'
    });
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({
      error: 'Message required',
      message: 'Follow-up message cannot be empty.'
    });
  }

  const result = ReportStore.addMessage(trackingId, trackingKey, message.trim(), evidenceUrl);

  if (!result) {
    return res.status(404).json({ error: 'Report not found' });
  }

  if (result.unauthorized) {
    return res.status(401).json({ error: 'Invalid tracking key' });
  }

  return res.status(200).json({
    success: true,
    message: 'Follow-up message added to confidential timeline.',
    report: sanitizeReportForReporter(result)
  });
});

/**
 * GET /api/categories
 * List supported report categories with guidance
 */
router.get('/categories', (req, res) => {
  const categoryDetails = [
    {
      id: 'Security',
      title: 'Security',
      description: 'Vulnerabilities, data leaks, compromised credentials, physical or cyber security breaches.'
    },
    {
      id: 'Harassment',
      title: 'Harassment & Discrimination',
      description: 'Workplace harassment, discrimination, hostile environment, bullying, retaliation.'
    },
    {
      id: 'Corruption',
      title: 'Corruption & Fraud',
      description: 'Bribery, embezzlement, financial malpractice, bid rigging, conflict of interest.'
    },
    {
      id: 'Technical',
      title: 'Technical Malpractice',
      description: 'Safety violations, regulatory compliance bypasses, deliberate code tampering, test falsification.'
    },
    {
      id: 'Other',
      title: 'Other Grievances',
      description: 'Any other serious ethical or operational concerns not covered by previous categories.'
    }
  ];

  return res.json({
    categories: categoryDetails
  });
});

export default router;
