import { Router } from 'express';
import {
  getIssues, getIssue, createIssue, updateIssueStatus,
  upvoteIssue, deleteIssue, verifyResolution, assignIssue
} from '../controllers/issue.controller';
import { protect, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';
import rateLimit from 'express-rate-limit';

const issueSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 issue submissions per window
  message: { success: false, message: 'Too many issues submitted from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.get('/', protect, getIssues);
router.get('/:id', protect, getIssue);
router.post('/', protect, issueSubmitLimiter, upload.array('images', 5), createIssue);
router.patch('/:id/status', protect, authorize('officer', 'admin'), upload.array('images', 5), updateIssueStatus);
router.patch('/:id/assignment', protect, authorize('admin'), assignIssue);
router.post('/:id/upvote', protect, upvoteIssue);
router.post('/:id/verify', protect, authorize('officer', 'admin'), verifyResolution);
router.delete('/:id', protect, deleteIssue);

export default router;
