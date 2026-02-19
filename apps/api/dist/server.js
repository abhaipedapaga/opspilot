"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
}));
app.use(express_1.default.json());
app.get("/health", (req, res) => {
    try {
        res.json({ status: "ok", service: "opspilot-api" });
    }
    catch (error) {
        console.error("Error in /health:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
});
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`OpsPilot API running on http://127.0.0.1:${PORT}`);
});
