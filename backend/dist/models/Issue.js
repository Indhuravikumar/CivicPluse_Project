"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const TimelineSchema = new mongoose_1.Schema({
    status: { type: String, required: true },
    message: { type: String, required: true },
    updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
});
const IssueSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    category: {
        type: String,
        required: true,
        enum: ['Pothole', 'Garbage', 'Drainage', 'Streetlight', 'Water Leakage', 'Road Damage',
            'Fallen Tree', 'Broken Footpath', 'Traffic Signal', 'Encroachment', 'Other'],
    },
    status: {
        type: String,
        enum: ['pending', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected'],
        default: 'pending',
    },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    priorityScore: { type: Number, default: 50, min: 0, max: 100 },
    location: {
        address: { type: String, required: true },
        lat: { type: Number, required: true, min: -90, max: 90 },
        lng: { type: Number, required: true, min: -180, max: 180 },
        ward: String,
        city: String,
    },
    images: [{ type: String }],
    reportedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    department: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Department' },
    timeline: [TimelineSchema],
    aiAnalysis: {
        confidence: Number,
        detectedCategory: String,
        spamProbability: Number,
        duplicateProbability: Number,
        suggestedDepartment: String,
    },
    verification: {
        isVerified: { type: Boolean, default: false },
        verifiedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
        verifiedAt: Date,
        resolutionQuality: String,
        notes: String,
    },
    upvotes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    duplicateOf: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Issue' },
    isDuplicate: { type: Boolean, default: false },
    isSpam: { type: Boolean, default: false },
    resolvedAt: Date,
    slaDue: Date,
    language: { type: String, default: 'en' },
}, { timestamps: true });
IssueSchema.index({ status: 1 });
IssueSchema.index({ category: 1 });
IssueSchema.index({ reportedBy: 1 });
IssueSchema.index({ department: 1 });
IssueSchema.index({ 'location.lat': 1, 'location.lng': 1 });
IssueSchema.index({ priorityScore: -1 });
IssueSchema.index({ createdAt: -1 });
IssueSchema.index({ title: 'text', description: 'text' });
exports.default = mongoose_1.default.model('Issue', IssueSchema);
//# sourceMappingURL=Issue.js.map