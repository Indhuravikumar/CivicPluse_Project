"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePriority = exports.getInsights = exports.checkDuplicate = exports.analyzeImage = exports.analyzeText = void 0;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const fs_1 = __importDefault(require("fs"));
const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const VALID_CATEGORIES = new Set([
    'Pothole', 'Garbage', 'Drainage', 'Streetlight', 'Water Leakage',
    'Road Damage', 'Fallen Tree', 'Broken Footpath', 'Traffic Signal',
    'Encroachment', 'Other'
]);
const analyzeText = async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title || !description || typeof title !== 'string' || typeof description !== 'string') {
            res.status(400).json({ success: false, message: 'Invalid text input' });
            return;
        }
        if (title.length > 200 || description.length > 1000) {
            res.status(400).json({ success: false, message: 'Text input exceeds maximum length' });
            return;
        }
        const payload = {
            ...req.body,
            title: title.trim(),
            description: description.trim()
        };
        const result = await axios_1.default.post(`${AI_URL}/api/ai/analyze-text`, payload, { timeout: 8000 });
        let detected_category = result.data?.detected_category || 'Other';
        if (!VALID_CATEGORIES.has(detected_category)) {
            detected_category = 'Other';
        }
        let confidence = Number(result.data?.confidence);
        if (isNaN(confidence) || confidence < 0 || confidence > 1)
            confidence = 0;
        res.json({ success: true, data: { ...result.data, detected_category, confidence } });
    }
    catch (err) {
        console.warn('AI analyzeText failed, returning fallback:', err.message);
        res.json({ success: true, data: { detected_category: null, confidence: 0, source: 'fallback' } });
    }
};
exports.analyzeText = analyzeText;
const analyzeImage = async (req, res) => {
    if (!req.file) {
        res.status(400).json({ success: false, message: 'No image provided' });
        return;
    }
    try {
        const form = new form_data_1.default();
        form.append('file', fs_1.default.createReadStream(req.file.path), req.file.originalname);
        const result = await axios_1.default.post(`${AI_URL}/api/ai/analyze-image`, form, {
            headers: form.getHeaders(), timeout: 10000,
        });
        res.json({ success: true, data: result.data });
    }
    catch (err) {
        console.warn('AI analyzeImage failed, returning fallback:', err.message);
        res.json({ success: true, data: { detected_category: null, confidence: 0, source: 'fallback' } });
    }
};
exports.analyzeImage = analyzeImage;
const checkDuplicate = async (req, res) => {
    try {
        if (!req.body.title) {
            res.status(400).json({ success: false, message: 'Missing title' });
            return;
        }
        const result = await axios_1.default.post(`${AI_URL}/api/ai/check-duplicate`, req.body, { timeout: 8000 });
        res.json({ success: true, data: result.data });
    }
    catch (err) {
        console.warn('AI checkDuplicate failed, returning fallback:', err.message);
        res.json({ success: true, data: { is_duplicate: false, confidence: 0, source: 'fallback' } });
    }
};
exports.checkDuplicate = checkDuplicate;
const getInsights = async (_req, res) => {
    try {
        const result = await axios_1.default.get(`${AI_URL}/api/ai/insights?limit=8`, { timeout: 8000 });
        res.json({ success: true, data: result.data });
    }
    catch (err) {
        console.warn('AI getInsights failed, returning fallback:', err.message);
        res.json({ success: true, data: { insights: [], source: 'fallback' } });
    }
};
exports.getInsights = getInsights;
const calculatePriority = async (req, res) => {
    try {
        if (!req.body.description) {
            res.status(400).json({ success: false, message: 'Missing description' });
            return;
        }
        const result = await axios_1.default.post(`${AI_URL}/api/ai/calculate-priority`, req.body, { timeout: 8000 });
        let priority_score = Number(result.data?.priority_score);
        if (isNaN(priority_score) || priority_score < 0)
            priority_score = 50;
        if (priority_score > 100)
            priority_score = 100;
        res.json({ success: true, data: { ...result.data, priority_score } });
    }
    catch (err) {
        console.warn('AI calculatePriority failed, returning fallback:', err.message);
        res.json({ success: true, data: { priority_score: 50, confidence: 0, source: 'fallback' } });
    }
};
exports.calculatePriority = calculatePriority;
//# sourceMappingURL=ai.controller.js.map