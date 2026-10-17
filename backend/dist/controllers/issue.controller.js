"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignIssue = exports.verifyResolution = exports.deleteIssue = exports.upvoteIssue = exports.updateIssueStatus = exports.createIssue = exports.getIssue = exports.getIssues = void 0;
const axios_1 = __importDefault(require("axios"));
const Issue_1 = __importDefault(require("../models/Issue"));
const Department_1 = __importDefault(require("../models/Department"));
const User_1 = __importDefault(require("../models/User"));
const Notification_1 = __importDefault(require("../models/Notification"));
const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const getIssues = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 10, 50);
        const skip = (page - 1) * limit;
        const filter = {};
        if (typeof req.query.status === 'string')
            filter.status = req.query.status;
        if (typeof req.query.category === 'string')
            filter.category = req.query.category;
        if (typeof req.query.severity === 'string')
            filter.severity = req.query.severity;
        if (typeof req.query.department === 'string')
            filter.department = req.query.department;
        if (typeof req.query.reportedBy === 'string')
            filter.reportedBy = req.query.reportedBy;
        if (req.user?.role === 'citizen')
            filter.reportedBy = req.user._id;
        if (typeof req.query.search === 'string')
            filter.$text = { $search: req.query.search };
        const sort = {};
        if (req.query.sortBy === 'priority')
            sort.priorityScore = -1;
        else if (req.query.sortBy === 'oldest')
            sort.createdAt = 1;
        else
            sort.createdAt = -1;
        const [issues, total] = await Promise.all([
            Issue_1.default.find(filter)
                .populate('reportedBy', 'name email avatar')
                .populate('department', 'name code')
                .populate('assignedTo', 'name email')
                .sort(sort).skip(skip).limit(limit).lean(),
            Issue_1.default.countDocuments(filter),
        ]);
        res.json({
            success: true,
            data: issues,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    }
    catch (err) {
        console.error('getIssues error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch issues' });
    }
};
exports.getIssues = getIssues;
const getIssue = async (req, res) => {
    try {
        const issue = await Issue_1.default.findById(req.params.id)
            .populate('reportedBy', 'name email avatar phone')
            .populate('department', 'name code contactEmail slaHours')
            .populate('assignedTo', 'name email')
            .populate('timeline.updatedBy', 'name role');
        if (!issue) {
            res.status(404).json({ success: false, message: 'Issue not found' });
            return;
        }
        res.json({ success: true, data: issue });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch issue' });
    }
};
exports.getIssue = getIssue;
const createIssue = async (req, res, next) => {
    try {
        const { title, description, category } = req.body;
        if (!title || !description || !category) {
            res.status(400).json({ success: false, message: 'Title, description and category are required' });
            return;
        }
        let locationData = { address: 'Unknown location', lat: 13.0827, lng: 80.2707 };
        try {
            if (req.body.location) {
                locationData = typeof req.body.location === 'string'
                    ? JSON.parse(req.body.location)
                    : req.body.location;
            }
        }
        catch { /* keep default */ }
        const images = req.files?.map(f => `/uploads/${f.filename}`) || [];
        let aiData = {};
        try {
            const aiRes = await axios_1.default.post(`${AI_URL}/api/ai/analyze-text`, {
                title, description, category, location: locationData.address || '',
            }, { timeout: 5000 });
            aiData = aiRes.data;
        }
        catch { /* AI unavailable — continue */ }
        const detectedCategory = aiData.detected_category || category;
        const dept = await Department_1.default.findOne({ categories: { $in: [detectedCategory] } });
        const priorityScore = aiData.priority_score || 50;
        const slaDue = new Date(Date.now() + ((dept?.slaHours || 72) * 3600 * 1000));
        const issue = await Issue_1.default.create({
            title,
            description,
            category: detectedCategory,
            location: locationData,
            images,
            reportedBy: req.user._id,
            department: dept?._id,
            severity: aiData.severity || 'medium',
            priorityScore,
            slaDue,
            language: aiData.language_detected || 'en',
            isSpam: aiData.is_spam || false,
            aiAnalysis: aiData.confidence ? {
                confidence: aiData.confidence,
                detectedCategory: aiData.detected_category,
                spamProbability: aiData.spam_probability,
                duplicateProbability: 0,
                suggestedDepartment: aiData.department_recommendation,
            } : undefined,
            timeline: [{ status: 'pending', message: 'Issue reported', updatedBy: req.user._id, timestamp: new Date() }],
        });
        if (dept)
            await Department_1.default.findByIdAndUpdate(dept._id, { $inc: { totalAssigned: 1 } });
        await Notification_1.default.create({
            user: req.user._id,
            title: 'Issue Submitted',
            message: `Your issue "${title}" has been submitted. Tracking ID: ${issue._id}`,
            type: 'success',
            issue: issue._id,
        }).catch(() => { });
        const populated = await issue.populate([
            { path: 'reportedBy', select: 'name email' },
            { path: 'department', select: 'name code' },
        ]);
        res.status(201).json({ success: true, data: populated });
    }
    catch (err) {
        next(err);
    }
};
exports.createIssue = createIssue;
const updateIssueStatus = async (req, res) => {
    try {
        const { status, message } = req.body;
        const issue = await Issue_1.default.findById(req.params.id);
        if (!issue) {
            res.status(404).json({ success: false, message: 'Issue not found' });
            return;
        }
        const VALID_TRANSITIONS = {
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
        if (status === 'resolved')
            issue.resolvedAt = new Date();
        issue.timeline.push({ status, message: message || `Status updated to ${status}`, updatedBy: req.user._id, timestamp: new Date() });
        await issue.save();
        await Notification_1.default.create({
            user: issue.reportedBy,
            title: 'Issue Status Updated',
            message: `Your issue "${issue.title}" status changed to ${status}.`,
            type: status === 'resolved' ? 'success' : 'update',
            issue: issue._id,
        }).catch(() => { });
        res.json({ success: true, data: issue });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update status' });
    }
};
exports.updateIssueStatus = updateIssueStatus;
const upvoteIssue = async (req, res) => {
    try {
        const issue = await Issue_1.default.findById(req.params.id);
        if (!issue) {
            res.status(404).json({ success: false, message: 'Issue not found' });
            return;
        }
        const userId = String(req.user._id);
        const alreadyUpvoted = issue.upvotes.some(id => id.toString() === userId);
        if (alreadyUpvoted) {
            issue.upvotes = issue.upvotes.filter(id => id.toString() !== userId);
        }
        else {
            issue.upvotes.push(req.user._id);
        }
        await issue.save();
        res.json({ success: true, upvotes: issue.upvotes.length, upvoted: !alreadyUpvoted });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Failed to upvote' });
    }
};
exports.upvoteIssue = upvoteIssue;
const deleteIssue = async (req, res) => {
    try {
        const issue = await Issue_1.default.findById(req.params.id);
        if (!issue) {
            res.status(404).json({ success: false, message: 'Issue not found' });
            return;
        }
        if (req.user?.role !== 'admin' && issue.reportedBy.toString() !== String(req.user?._id)) {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }
        await issue.deleteOne();
        res.json({ success: true, message: 'Issue deleted' });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete issue' });
    }
};
exports.deleteIssue = deleteIssue;
const verifyResolution = async (req, res) => {
    try {
        const issue = await Issue_1.default.findById(req.params.id);
        if (!issue) {
            res.status(404).json({ success: false, message: 'Issue not found' });
            return;
        }
        let verificationResult = { is_resolved: true, confidence: 0.85, resolution_quality: 'good', verification_notes: 'Resolved.' };
        try {
            const aiRes = await axios_1.default.post(`${AI_URL}/api/ai/verify-resolution`, {
                issue_id: req.params.id,
                before_description: issue.description,
                after_description: req.body.afterDescription || '',
            }, { timeout: 5000 });
            verificationResult = aiRes.data;
        }
        catch { /* use defaults */ }
        issue.verification = {
            isVerified: verificationResult.is_resolved,
            verifiedBy: req.user._id,
            verifiedAt: new Date(),
            resolutionQuality: verificationResult.resolution_quality,
            notes: verificationResult.verification_notes,
        };
        if (verificationResult.is_resolved) {
            issue.status = 'closed';
            issue.timeline.push({ status: 'closed', message: 'Verified and closed', updatedBy: req.user._id, timestamp: new Date() });
        }
        await issue.save();
        res.json({ success: true, data: issue, aiVerification: verificationResult });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Verification failed' });
    }
};
exports.verifyResolution = verifyResolution;
const assignIssue = async (req, res, next) => {
    try {
        const { department, assignedTo } = req.body;
        const issue = await Issue_1.default.findById(req.params.id);
        if (!issue) {
            res.status(404).json({ success: false, message: 'Issue not found' });
            return;
        }
        const oldDept = issue.department;
        const oldAssignee = issue.assignedTo;
        // Skip if unchanged
        if ((!department || String(oldDept) === String(department)) &&
            (!assignedTo || String(oldAssignee) === String(assignedTo))) {
            res.json({ success: true, data: issue });
            return;
        }
        if (department) {
            const deptObj = await Department_1.default.findById(department);
            if (!deptObj || !deptObj.isActive) {
                res.status(400).json({ success: false, message: 'Invalid or inactive department' });
                return;
            }
            issue.department = department;
        }
        if (assignedTo) {
            const userObj = await User_1.default.findById(assignedTo);
            if (!userObj || !userObj.isActive || userObj.role !== 'officer') {
                res.status(400).json({ success: false, message: 'Invalid or inactive officer' });
                return;
            }
            if (req.user?.role === 'officer') {
                if (String(userObj.department) !== String(req.user.department)) {
                    res.status(403).json({ success: false, message: 'Cannot assign officer from another department' });
                    return;
                }
            }
            issue.assignedTo = assignedTo;
            if (issue.status === 'pending')
                issue.status = 'assigned';
        }
        if (String(oldDept) !== String(issue.department)) {
            if (oldDept)
                await Department_1.default.findByIdAndUpdate(oldDept, { $inc: { totalAssigned: -1 } });
            if (issue.department)
                await Department_1.default.findByIdAndUpdate(issue.department, { $inc: { totalAssigned: 1 } });
        }
        issue.timeline.push({
            status: issue.status,
            message: 'Issue assignment updated',
            updatedBy: req.user._id,
            timestamp: new Date()
        });
        await issue.save();
        await Notification_1.default.create({
            user: issue.reportedBy,
            title: 'Issue Assigned',
            message: `Your issue "${issue.title}" has been assigned.`,
            type: 'update',
            issue: issue._id,
        }).catch(() => { });
        if (issue.assignedTo) {
            await Notification_1.default.create({
                user: issue.assignedTo,
                title: 'New Issue Assigned',
                message: `You have been assigned to issue "${issue.title}".`,
                type: 'info',
                issue: issue._id,
            }).catch(() => { });
        }
        const populated = await issue.populate([
            { path: 'reportedBy', select: 'name email avatar phone' },
            { path: 'department', select: 'name code contactEmail slaHours' },
            { path: 'assignedTo', select: 'name email' },
            { path: 'timeline.updatedBy', select: 'name role' }
        ]);
        res.json({ success: true, data: populated });
    }
    catch (err) {
        next(err);
    }
};
exports.assignIssue = assignIssue;
//# sourceMappingURL=issue.controller.js.map