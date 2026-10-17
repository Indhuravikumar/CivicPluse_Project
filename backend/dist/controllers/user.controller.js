"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.getUser = exports.getUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const getUsers = async (_req, res) => {
    const users = await User_1.default.find().select('-password').populate('department', 'name code').lean();
    res.json({ success: true, data: users });
};
exports.getUsers = getUsers;
const getUser = async (req, res) => {
    const user = await User_1.default.findById(req.params.id).select('-password').populate('department', 'name code');
    if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
    }
    res.json({ success: true, data: user });
};
exports.getUser = getUser;
const updateUser = async (req, res) => {
    const { role, department, isActive, isVerified } = req.body;
    const user = await User_1.default.findByIdAndUpdate(req.params.id, { role, department, isActive, isVerified }, { new: true, runValidators: true }).select('-password');
    if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
    }
    res.json({ success: true, data: user });
};
exports.updateUser = updateUser;
//# sourceMappingURL=user.controller.js.map