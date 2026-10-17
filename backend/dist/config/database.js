"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("./logger"));
const connectDB = async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/civicpulse';
    try {
        await mongoose_1.default.connect(uri);
        logger_1.default.info('✅ MongoDB connected successfully');
    }
    catch (error) {
        logger_1.default.error('❌ MongoDB connection failed. Please check the MongoDB server.');
        process.exit(1);
    }
};
exports.connectDB = connectDB;
mongoose_1.default.connection.on('disconnected', () => {
    logger_1.default.warn('MongoDB disconnected');
});
mongoose_1.default.connection.on('error', () => {
    logger_1.default.error('MongoDB error occurred after connection was established.');
});
//# sourceMappingURL=database.js.map