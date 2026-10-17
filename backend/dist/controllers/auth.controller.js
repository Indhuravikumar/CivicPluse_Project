"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = exports.getMe = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const signToken = (id) => jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
});
const sendToken = (user, statusCode, res) => {
    const token = signToken(String(user._id));
    const userObj = user.toObject();
    delete userObj.password;
    res.status(statusCode).json({ success: true, token, user: userObj });
};
const register = async (req, res) => {
    try {
        const { name, email, password, phone, address, ward } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ success: false, message: 'Name, email and password are required' });
            return;
        }
        const existing = await User_1.default.findOne({ email: email.toLowerCase() });
        if (existing) {
            res.status(400).json({ success: false, message: 'Email already registered' });
            return;
        }
        const user = await User_1.default.create({ name, email: email.toLowerCase(), password, phone, address, ward, role: 'citizen' });
        sendToken(user, 201, res);
    }
    catch (err) {
        console.error('Register error:', err);
        const msg = err instanceof Error ? err.message : 'Registration failed';
        res.status(500).json({ success: false, message: msg });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: 'Please provide email and password' });
            return;
        }
        const user = await User_1.default.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
            return;
        }
        if (!user.isActive) {
            res.status(401).json({ success: false, message: 'Account is deactivated' });
            return;
        }
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });
        sendToken(user, 200, res);
    }
    catch (err) {
        console.error('Login error:', err);
        const msg = err instanceof Error ? err.message : 'Login failed';
        res.status(500).json({ success: false, message: msg });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?._id).populate('department', 'name code');
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.json({ success: true, user });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch user' });
    }
};
exports.getMe = getMe;
const updateProfile = async (req, res) => {
    try {
        const allowed = ['name', 'phone', 'address', 'ward', 'avatar'];
        const updates = {};
        for (const field of allowed) {
            if (req.body[field] !== undefined)
                updates[field] = req.body[field];
        }
        const user = await User_1.default.findByIdAndUpdate(req.user?._id, updates, { new: true, runValidators: true });
        res.json({ success: true, user });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User_1.default.findById(req.user?._id).select('+password');
        if (!user || !(await user.comparePassword(currentPassword))) {
            res.status(401).json({ success: false, message: 'Current password is incorrect' });
            return;
        }
        user.password = newPassword;
        await user.save();
        sendToken(user, 200, res);
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Failed to change password' });
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=auth.controller.js.map