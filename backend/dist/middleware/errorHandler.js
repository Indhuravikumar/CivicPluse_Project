"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = exports.errorHandler = void 0;
const logger_1 = __importDefault(require("../config/logger"));
const errorHandler = (err, _req, res, _next) => {
    let error = { ...err };
    error.message = err.message;
    error.statusCode = err.statusCode;
    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
        error = (0, exports.createError)(`An account with this ${field} already exists`, 400);
    }
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors || {}).map((val) => val.message).join(', ');
        error = (0, exports.createError)(message, 400);
    }
    // Mongoose cast error
    if (err.name === 'CastError') {
        error = (0, exports.createError)('Resource not found', 404);
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = (0, exports.createError)('Invalid token. Please log in again.', 401);
    }
    if (err.name === 'TokenExpiredError') {
        error = (0, exports.createError)('Your token has expired. Please log in again.', 401);
    }
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    if (statusCode >= 500)
        logger_1.default.error(err.stack || message);
    res.status(statusCode).json({
        success: false,
        message,
    });
};
exports.errorHandler = errorHandler;
const createError = (message, statusCode) => {
    const err = new Error(message);
    err.statusCode = statusCode;
    err.isOperational = true;
    return err;
};
exports.createError = createError;
//# sourceMappingURL=errorHandler.js.map