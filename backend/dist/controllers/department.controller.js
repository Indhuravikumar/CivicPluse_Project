"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDepartmentOfficers = exports.updateDepartment = exports.createDepartment = exports.getDepartment = exports.getDepartments = void 0;
const Department_1 = __importDefault(require("../models/Department"));
const User_1 = __importDefault(require("../models/User"));
const getDepartments = async (req, res, next) => {
    try {
        const depts = await Department_1.default.find({ isActive: true })
            .populate('headOfficer', 'name email')
            .lean();
        res.json({ success: true, data: depts });
    }
    catch (err) {
        next(err);
    }
};
exports.getDepartments = getDepartments;
const getDepartment = async (req, res, next) => {
    try {
        const dept = await Department_1.default.findById(req.params.id).populate('headOfficer', 'name email');
        if (!dept) {
            res.status(404).json({ success: false, message: 'Department not found' });
            return;
        }
        res.json({ success: true, data: dept });
    }
    catch (err) {
        next(err);
    }
};
exports.getDepartment = getDepartment;
const createDepartment = async (req, res, next) => {
    try {
        const { name, code, description, categories, contactEmail, contactPhone, slaHours, headOfficer, isActive } = req.body;
        const dept = await Department_1.default.create({
            name, code, description, categories, contactEmail, contactPhone, slaHours, headOfficer, isActive
        });
        res.status(201).json({ success: true, data: dept });
    }
    catch (err) {
        next(err);
    }
};
exports.createDepartment = createDepartment;
const updateDepartment = async (req, res, next) => {
    try {
        const { name, code, description, categories, contactEmail, contactPhone, slaHours, headOfficer, isActive } = req.body;
        const updates = { name, code, description, categories, contactEmail, contactPhone, slaHours, headOfficer, isActive };
        // Remove undefined fields
        Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);
        const dept = await Department_1.default.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
        if (!dept) {
            res.status(404).json({ success: false, message: 'Department not found' });
            return;
        }
        res.json({ success: true, data: dept });
    }
    catch (err) {
        next(err);
    }
};
exports.updateDepartment = updateDepartment;
const getDepartmentOfficers = async (req, res, next) => {
    try {
        const officers = await User_1.default.find({ department: req.params.id, role: 'officer', isActive: true }).select('-password');
        res.json({ success: true, data: officers });
    }
    catch (err) {
        next(err);
    }
};
exports.getDepartmentOfficers = getDepartmentOfficers;
//# sourceMappingURL=department.controller.js.map