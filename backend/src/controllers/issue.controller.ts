import { Response } from 'express';
import axios from 'axios';
import Issue from '../models/Issue';
import Department from '../models/Department';
import User from '../models/User';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/auth';

const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const getIssues = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (typeof req.query.status === 'string' && req.query.status) {
      if (req.query.status.includes(',')) {
        filter.status = { $in: req.query.status.split(',') };
      } else {
        filter.status = req.query.status;
      }
    }
    if (typeof req.query.category === 'string' && req.query.category) filter.category = req.query.category;
    if (typeof req.query.severity === 'string' && req.query.severity) filter.severity = req.query.severity;
    if (typeof req.query.department === 'string' && req.query.department) filter.department = req.query.department;
    if (typeof req.query.reportedBy === 'string' && req.query.reportedBy) filter.reportedBy = req.query.reportedBy;
    if (typeof req.query.assignedTo === 'string' && req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
    if (typeof req.query.search === 'string' && req.query.search) filter.$text = { $search: req.query.search };

    // Strict Role-Based Visibility Rules
    if (req.user?.role === 'citizen') {
      // Citizens ONLY see their own reports
      filter.reportedBy = req.user._id;
    } else if (req.user?.role === 'officer') {
      // Officers ONLY see their assigned reports or reports in their department
      filter.$or = [
        { assignedTo: req.user._id },
        { department: req.user.department }
      ];
    }
    // Admin sees everything by default

    type SortDir = 1 | -1;
    const sort: Record<string, SortDir> = {};
    if (req.query.sortBy === 'priority') sort.priorityScore = -1;
    else if (req.query.sortBy === 'oldest') sort.createdAt = 1;
    else sort.createdAt = -1;

    const [issues, total] = await Promise.all([
      Issue.find(filter)
        .populate('reportedBy', 'name email avatar')
        .populate('department', 'name code')
        .populate('assignedTo', 'name email')
        .sort(sort).skip(skip).limit(limit).lean(),
      Issue.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: issues,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('getIssues error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch issues' });
  }
};

export const getIssue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name email avatar phone')
      .populate('department', 'name code contactEmail slaHours')
      .populate('assignedTo', 'name email')
      .populate('timeline.updatedBy', 'name role');
    if (!issue) { res.status(404).json({ success: false, message: 'Issue not found' }); return; }
    
    if (req.user?.role === 'citizen' && String((issue.reportedBy as any)?._id || issue.reportedBy) !== String(req.user._id)) {
      res.status(403).json({ success: false, message: 'Not authorized to view this issue' });
      return;
    }
    if (req.user?.role === 'officer') {
      const isAssigned = String((issue.assignedTo as any)?._id || issue.assignedTo) === String(req.user._id);
      const isMyDept = String((issue.department as any)?._id || issue.department) === String(req.user.department);
      if (!isAssigned && !isMyDept) {
        res.status(403).json({ success: false, message: 'Not authorized to view this issue' });
        return;
      }
    }

    res.json({ success: true, data: issue });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch issue' });
  }
};

export const createIssue = async (req: AuthRequest, res: Response, next: import('express').NextFunction): Promise<void> => {
  try {
    const { title, description, category } = req.body;
    if (!title || !description || !category) {
      res.status(400).json({ success: false, message: 'Title, description and category are required' });
      return;
    }

    let rawLocation: any = { address: 'Unknown location', lat: 13.0827, lng: 80.2707 };
    try {
      if (req.body.location) {
        rawLocation = typeof req.body.location === 'string'
          ? JSON.parse(req.body.location)
          : req.body.location;
      }
    } catch { /* keep default */ }

    const lat = Number(rawLocation.lat);
    const lng = Number(rawLocation.lng);
    const address = String(rawLocation.address || 'Unknown location').trim();

    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      res.status(400).json({ success: false, message: 'Invalid coordinates provided' });
      return;
    }

    const locationData = { address, lat, lng };

    const images = (req.files as Express.Multer.File[])?.map(f => `/uploads/${f.filename}`) || [];

    let aiData: Record<string, unknown> = {};
    try {
      const aiRes = await axios.post(`${AI_URL}/api/ai/analyze-text`, {
        title, description, category, location: locationData.address || '',
      }, { timeout: 5000 });
      aiData = aiRes.data;
    } catch { /* AI unavailable — continue */ }

    const detectedCategory = (aiData.detected_category as string) || category;
    const dept = await Department.findOne({ categories: { $in: [detectedCategory] } });
    const priorityScore = (aiData.priority_score as number) || 50;
    const slaDue = new Date(Date.now() + ((dept?.slaHours || 72) * 3600 * 1000));

    let assignedTo;
    let initialStatus = 'pending';
    const timeline = [{ status: 'pending', message: 'Issue reported', updatedBy: req.user!._id, timestamp: new Date() }];

    if (dept) {
      const eligibleOfficers = await User.find({ role: 'officer', department: dept._id, isActive: true });
      
      if (eligibleOfficers.length > 0) {
        const officerIds = eligibleOfficers.map(o => o._id);
        
        const workloadStats = await Issue.aggregate([
          { $match: { assignedTo: { $in: officerIds }, status: { $in: ['pending', 'assigned', 'in_progress'] } } },
          { $group: { _id: '$assignedTo', count: { $sum: 1 } } }
        ]);
        
        const workloadMap = new Map();
        workloadStats.forEach(stat => workloadMap.set(String(stat._id), stat.count));

        const assignmentHistory = await Issue.aggregate([
          { $match: { assignedTo: { $in: officerIds } } },
          { $group: { _id: '$assignedTo', lastAssignedAt: { $max: '$createdAt' } } }
        ]);
        
        const lastAssignedMap = new Map();
        assignmentHistory.forEach(hist => lastAssignedMap.set(String(hist._id), new Date(hist.lastAssignedAt).getTime()));

        const workloads = eligibleOfficers.map(o => workloadMap.get(String(o._id)) || 0);
        const minWorkload = Math.min(...workloads);

        const tiedOfficers = eligibleOfficers.filter(o => (workloadMap.get(String(o._id)) || 0) === minWorkload);

        let selectedOfficer = tiedOfficers[0];

        if (tiedOfficers.length > 1) {
          selectedOfficer = tiedOfficers.reduce((prev, current) => {
            const prevLastAssigned = lastAssignedMap.get(String(prev._id)) || 0;
            const currentLastAssigned = lastAssignedMap.get(String(current._id)) || 0;

            if (prevLastAssigned !== currentLastAssigned) {
              return prevLastAssigned < currentLastAssigned ? prev : current;
            }

            const prevCreated = prev.createdAt ? new Date(prev.createdAt).getTime() : 0;
            const currentCreated = current.createdAt ? new Date(current.createdAt).getTime() : 0;
            if (prevCreated !== currentCreated) {
              return prevCreated < currentCreated ? prev : current;
            }

            return String(prev._id) < String(current._id) ? prev : current;
          });
        }

        assignedTo = selectedOfficer._id;
        initialStatus = 'assigned';
        timeline.push({ status: 'assigned', message: 'Issue automatically assigned', updatedBy: req.user!._id, timestamp: new Date() });
      }
    }

    const issue = await Issue.create({
      title,
      description,
      category: detectedCategory,
      location: locationData,
      images,
      reportedBy: req.user!._id,
      department: dept?._id,
      assignedTo,
      status: initialStatus,
      severity: (aiData.severity as string) || 'medium',
      priorityScore,
      slaDue,
      language: (aiData.language_detected as string) || 'en',
      isSpam: (aiData.is_spam as boolean) || false,
      aiAnalysis: aiData.confidence ? {
        confidence: aiData.confidence,
        detectedCategory: aiData.detected_category,
        spamProbability: aiData.spam_probability,
        duplicateProbability: 0,
        suggestedDepartment: aiData.department_recommendation,
      } : undefined,
      timeline,
    });

    if (dept) await Department.findByIdAndUpdate(dept._id, { $inc: { totalAssigned: 1 } });

    await Notification.create({
      user: req.user!._id,
      title: 'Issue Submitted',
      message: `Your issue "${title}" has been submitted. Tracking ID: ${issue._id}`,
      type: 'success',
      issue: issue._id,
    }).catch(() => {});

    if (assignedTo) {
      await Notification.create({
        user: assignedTo,
        title: 'New Issue Assigned',
        message: `You have been automatically assigned to issue "${title}".`,
        type: 'info',
        issue: issue._id,
      }).catch(() => {});
    }

    const populated = await issue.populate([
      { path: 'reportedBy', select: 'name email' },
      { path: 'department', select: 'name code' },
    ]);

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

export const updateIssueStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, message } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) { res.status(404).json({ success: false, message: 'Issue not found' }); return; }

    if (req.user?.role === 'officer' && String(issue.assignedTo) !== String(req.user._id)) {
      res.status(403).json({ success: false, message: 'Not authorized to modify this issue. It is not assigned to you.' });
      return;
    }

    const VALID_TRANSITIONS: Record<string, string[]> = {
      pending: ['assigned', 'rejected'],
      assigned: ['in_progress', 'pending'],
      in_progress: ['resolved', 'assigned'],
      resolved: ['closed', 'in_progress'],
      closed: [],
      rejected: []
    };

    const allowedNext = VALID_TRANSITIONS[issue.status] || [];
    if (!allowedNext.includes(status) && status !== issue.status) {
      res.status(400).json({ success: false, message: `Invalid status transition from ${issue.status} to ${status}` });
      return;
    }

    if (status === issue.status && message === undefined) {
      res.json({ success: true, data: issue });
      return;
    }

    issue.status = status;
    if (status === 'resolved') {
      issue.resolvedAt = new Date();
      issue.resolvedBy = req.user!._id as unknown as import('mongoose').Types.ObjectId;
      if (req.body.resolutionNotes) issue.resolutionNotes = req.body.resolutionNotes;
      const images = (req.files as Express.Multer.File[])?.map(f => `/uploads/${f.filename}`) || [];
      if (images.length > 0) issue.resolutionEvidence = images;
    }
    
    issue.timeline.push({ status, message: message || `Status updated to ${status}`, updatedBy: req.user!._id, timestamp: new Date() });
    await issue.save();

    await Notification.create({
      user: issue.reportedBy,
      title: 'Issue Status Updated',
      message: `Your issue "${issue.title}" status changed to ${status}.`,
      type: status === 'resolved' ? 'success' : 'update',
      issue: issue._id,
    }).catch(() => {});

    res.json({ success: true, data: issue });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

export const upvoteIssue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) { res.status(404).json({ success: false, message: 'Issue not found' }); return; }
    const userId = String(req.user!._id);
    const alreadyUpvoted = issue.upvotes.some(id => id.toString() === userId);
    if (alreadyUpvoted) {
      issue.upvotes = issue.upvotes.filter(id => id.toString() !== userId);
    } else {
      issue.upvotes.push(req.user!._id as unknown as typeof issue.upvotes[0]);
    }
    await issue.save();
    res.json({ success: true, upvotes: issue.upvotes.length, upvoted: !alreadyUpvoted });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to upvote' });
  }
};

export const deleteIssue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) { res.status(404).json({ success: false, message: 'Issue not found' }); return; }
    if (req.user?.role !== 'admin' && issue.reportedBy.toString() !== String(req.user?._id)) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }
    await issue.deleteOne();
    res.json({ success: true, message: 'Issue deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete issue' });
  }
};

export const verifyResolution = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) { res.status(404).json({ success: false, message: 'Issue not found' }); return; }

    let verificationResult: Record<string, unknown> = { is_resolved: true, confidence: 0.85, resolution_quality: 'good', verification_notes: 'Resolved.' };
    try {
      const aiRes = await axios.post(`${AI_URL}/api/ai/verify-resolution`, {
        issue_id: req.params.id,
        before_description: issue.description,
        after_description: req.body.afterDescription || '',
      }, { timeout: 5000 });
      verificationResult = aiRes.data;
    } catch { /* use defaults */ }

    issue.verification = {
      isVerified: verificationResult.is_resolved as boolean,
      verifiedBy: req.user!._id as unknown as import('mongoose').Types.ObjectId,
      verifiedAt: new Date(),
      resolutionQuality: verificationResult.resolution_quality as string,
      notes: verificationResult.verification_notes as string,
    };
    if (verificationResult.is_resolved) {
      issue.status = 'closed';
      issue.timeline.push({ status: 'closed', message: 'Verified and closed', updatedBy: req.user!._id, timestamp: new Date() });
    }
    await issue.save();
    res.json({ success: true, data: issue, aiVerification: verificationResult });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
};

export const assignIssue = async (req: AuthRequest, res: Response, next: import('express').NextFunction): Promise<void> => {
  try {
    const { department, assignedTo } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) { res.status(404).json({ success: false, message: 'Issue not found' }); return; }

    const oldDept = issue.department;
    const oldAssignee = issue.assignedTo;

    // Skip if unchanged
    if (
      (!department || String(oldDept) === String(department)) &&
      (!assignedTo || String(oldAssignee) === String(assignedTo))
    ) {
      res.json({ success: true, data: issue });
      return;
    }

    if (department) {
      const deptObj = await Department.findById(department);
      if (!deptObj || !deptObj.isActive) {
        res.status(400).json({ success: false, message: 'Invalid or inactive department' });
        return;
      }
      issue.department = department;
    }

    if (assignedTo) {
      const userObj = await User.findById(assignedTo);
      if (!userObj || !userObj.isActive || userObj.role !== 'officer') {
        res.status(400).json({ success: false, message: 'Invalid or inactive officer' });
        return;
      }
      
      const targetDept = department || issue.department;
      if (String(userObj.department) !== String(targetDept)) {
        res.status(400).json({ success: false, message: 'Officer does not belong to the assigned department' });
        return;
      }
      if (req.user?.role === 'officer') {
        if (String(userObj.department) !== String(req.user.department)) {
          res.status(403).json({ success: false, message: 'Cannot assign officer from another department' });
          return;
        }
      }
      issue.assignedTo = assignedTo;
      if (issue.status === 'pending') issue.status = 'assigned';
    }

    if (String(oldDept) !== String(issue.department)) {
      if (oldDept) await Department.findByIdAndUpdate(oldDept, { $inc: { totalAssigned: -1 } });
      if (issue.department) await Department.findByIdAndUpdate(issue.department, { $inc: { totalAssigned: 1 } });
    }

    issue.timeline.push({
      status: issue.status,
      message: 'Issue assignment updated',
      updatedBy: req.user!._id,
      timestamp: new Date()
    });

    await issue.save();
    
    await Notification.create({
      user: issue.reportedBy,
      title: 'Issue Assigned',
      message: `Your issue "${issue.title}" has been assigned.`,
      type: 'update',
      issue: issue._id,
    }).catch(() => {});

    if (issue.assignedTo) {
      await Notification.create({
        user: issue.assignedTo,
        title: 'New Issue Assigned',
        message: `You have been assigned to issue "${issue.title}".`,
        type: 'info',
        issue: issue._id,
      }).catch(() => {});
    }

    const populated = await issue.populate([
      { path: 'reportedBy', select: 'name email avatar phone' },
      { path: 'department', select: 'name code contactEmail slaHours' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'timeline.updatedBy', select: 'name role' }
    ]);

    res.json({ success: true, data: populated });
  } catch (err) { next(err); }
};
