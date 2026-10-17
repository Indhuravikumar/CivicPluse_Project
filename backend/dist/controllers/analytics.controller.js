"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSeverityStats = exports.getHeatmapData = exports.getDepartmentPerformance = exports.getTrends = exports.getStatusStats = exports.getCategoryStats = exports.getDashboardStats = void 0;
const Issue_1 = __importDefault(require("../models/Issue"));
const User_1 = __importDefault(require("../models/User"));
const Department_1 = __importDefault(require("../models/Department"));
const getDashboardStats = async (_req, res, next) => {
    try {
        const [totalIssues, pendingIssues, resolvedIssues, criticalIssues, totalUsers, totalDepts, inProgressIssues] = await Promise.all([
            Issue_1.default.countDocuments(),
            Issue_1.default.countDocuments({ status: { $in: ['pending', 'assigned'] } }),
            Issue_1.default.countDocuments({ status: { $in: ['resolved', 'closed'] } }),
            Issue_1.default.countDocuments({ severity: 'critical', status: { $nin: ['resolved', 'closed'] } }),
            User_1.default.countDocuments({ role: 'citizen' }),
            Department_1.default.countDocuments({ isActive: true }),
            Issue_1.default.countDocuments({ status: 'in_progress' }),
        ]);
        const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;
        res.json({ success: true, data: { totalIssues, pendingIssues, resolvedIssues, criticalIssues, inProgressIssues, totalUsers, totalDepts, resolutionRate } });
    }
    catch (err) {
        next(err);
    }
};
exports.getDashboardStats = getDashboardStats;
const getCategoryStats = async (_req, res, next) => {
    try {
        const stats = await Issue_1.default.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 }, resolved: { $sum: { $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0] } } } },
            { $sort: { count: -1 } },
        ]);
        res.json({ success: true, data: stats });
    }
    catch (err) {
        next(err);
    }
};
exports.getCategoryStats = getCategoryStats;
const getStatusStats = async (_req, res, next) => {
    try {
        const stats = await Issue_1.default.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        res.json({ success: true, data: stats });
    }
    catch (err) {
        next(err);
    }
};
exports.getStatusStats = getStatusStats;
const getTrends = async (req, res, next) => {
    try {
        const days = Math.min(parseInt(req.query.days) || 30, 365);
        const since = new Date(Date.now() - days * 24 * 3600 * 1000);
        const trends = await Issue_1.default.aggregate([
            { $match: { createdAt: { $gte: since } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, reported: { $sum: 1 }, resolved: { $sum: { $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0] } } } },
            { $sort: { _id: 1 } },
        ]);
        res.json({ success: true, data: trends });
    }
    catch (err) {
        next(err);
    }
};
exports.getTrends = getTrends;
const getDepartmentPerformance = async (req, res, next) => {
    try {
        const matchStage = { department: { $exists: true } };
        if (req.user?.role === 'officer' && req.user.department) {
            matchStage.department = req.user.department;
        }
        const stats = await Issue_1.default.aggregate([
            { $match: matchStage },
            { $group: { _id: '$department', total: { $sum: 1 }, resolved: { $sum: { $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0] } }, avgPriority: { $avg: '$priorityScore' } } },
            { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
            { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
            { $project: { name: '$dept.name', code: '$dept.code', total: 1, resolved: 1, avgPriority: { $round: ['$avgPriority', 1] }, resolutionRate: { $round: [{ $multiply: [{ $divide: ['$resolved', { $max: ['$total', 1] }] }, 100] }, 1] } } },
            { $sort: { resolutionRate: -1 } },
        ]);
        res.json({ success: true, data: stats });
    }
    catch (err) {
        next(err);
    }
};
exports.getDepartmentPerformance = getDepartmentPerformance;
const getHeatmapData = async (_req, res, next) => {
    try {
        const data = await Issue_1.default.find({ 'location.lat': { $exists: true }, status: { $nin: ['closed'] } }, { 'location.lat': 1, 'location.lng': 1, severity: 1, category: 1, priorityScore: 1 }).limit(500).lean();
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getHeatmapData = getHeatmapData;
const getSeverityStats = async (_req, res, next) => {
    try {
        const stats = await Issue_1.default.aggregate([
            { $group: { _id: '$severity', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        res.json({ success: true, data: stats });
    }
    catch (err) {
        next(err);
    }
};
exports.getSeverityStats = getSeverityStats;
//# sourceMappingURL=analytics.controller.js.map