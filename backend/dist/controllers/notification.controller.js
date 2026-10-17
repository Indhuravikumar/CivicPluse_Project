"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllAsRead = exports.markAsRead = exports.getNotifications = void 0;
const Notification_1 = __importDefault(require("../models/Notification"));
const getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification_1.default.find({ user: req.user._id })
            .sort({ createdAt: -1 }).limit(50).populate('issue', 'title status');
        const unreadCount = await Notification_1.default.countDocuments({ user: req.user._id, isRead: false });
        res.json({ success: true, data: notifications, unreadCount });
    }
    catch (err) {
        next(err);
    }
};
exports.getNotifications = getNotifications;
const markAsRead = async (req, res, next) => {
    try {
        const notif = await Notification_1.default.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isRead: true }, { new: true });
        if (!notif) {
            res.status(404).json({ success: false, message: 'Notification not found' });
            return;
        }
        res.json({ success: true, data: notif });
    }
    catch (err) {
        next(err);
    }
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (req, res, next) => {
    try {
        await Notification_1.default.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
        res.json({ success: true, message: 'All notifications marked as read' });
    }
    catch (err) {
        next(err);
    }
};
exports.markAllAsRead = markAllAsRead;
//# sourceMappingURL=notification.controller.js.map