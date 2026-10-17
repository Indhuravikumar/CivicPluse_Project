"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
const logger_1 = __importDefault(require("./config/logger"));
const PORT = parseInt(process.env.PORT || '5000', 10);
process.on('uncaughtException', (err) => {
    logger_1.default.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
    process.exit(1);
});
let server;
const startServer = async () => {
    await (0, database_1.connectDB)();
    server = app_1.default.listen(PORT, () => {
        logger_1.default.info(`🚀 CivicPulse API running on port ${PORT}`);
        logger_1.default.info(`📦 Environment: ${process.env.NODE_ENV}`);
        logger_1.default.info(`🤖 AI Service: ${process.env.AI_SERVICE_URL}`);
    });
};
startServer().catch((err) => {
    logger_1.default.error('Failed to start server:', err);
    process.exit(1);
});
process.on('unhandledRejection', (err) => {
    logger_1.default.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    else {
        process.exit(1);
    }
});
const gracefulShutdown = () => {
    logger_1.default.info('Received termination signal. Closing HTTP server and database connection...');
    if (server) {
        server.close(async () => {
            logger_1.default.info('HTTP server closed.');
            await mongoose_1.default.disconnect();
            logger_1.default.info('MongoDB disconnected.');
            process.exit(0);
        });
    }
    else {
        process.exit(0);
    }
};
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
//# sourceMappingURL=server.js.map