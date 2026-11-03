
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

import AuthRoute from "./routes/AuthRoute.js";
import StudentRoute from "./routes/StudentRoute.js";
import ScoreRoute from "./routes/ScoreRoute.js";
import AttendanceRoute from "./routes/AttendanceRoute.js";
import DashboardRoute from "./routes/DashboardRoute.js";
import UserRoute from "./routes/UserRoute.js";
import InformationRoute from "./routes/InformationRoute.js";

// Load environment variables
dotenv.config({
    path: fileURLToPath(new URL("../.env", import.meta.url))
});

const app = express();

// CORS configuration
const allowedOrigins = new Set([
    process.env.FRONTEND_URL,
    process.env.APP_FRONTEND_URL,
    ...(process.env.CORS_ORIGINS || "").split(","),
    "https://student-management-frontend-lake-sigma.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173"
].map((origin) => origin?.trim()).filter(Boolean).map((origin) => origin.replace(/\/+$/, "")));

const isAllowedOrigin = (origin) => {
    if (!origin) return true;

    return allowedOrigins.has(origin.replace(/\/+$/, ""));
};

export const corsMiddleware = cors({
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
});

app.use((req, res, next) => {
    if (req.corsHandled) {
        return next();
    }

    return corsMiddleware(req, res, (error) => {
        if (!error) {
            req.corsHandled = true;
        }
        next(error);
    });
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API health check
app.get("/", (req, res) => {
    res.status(200).json({ status: "ok" });
});

// API routes
app.use("/api", AuthRoute);
app.use("/api", StudentRoute);
app.use("/api", ScoreRoute);
app.use("/api", AttendanceRoute);
app.use("/api", DashboardRoute);
app.use("/api", UserRoute);
app.use("/api", InformationRoute);

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error("Unhandled request error:", error);

    if (res.headersSent) {
        return next(error);
    }

    const status = error.status === 413 ? 413 : 500;

    const message = status === 413
        ? "Uploaded images must be 5 MB or smaller."
        : "Internal server error";

    res.status(status).json({
        success: false,
        message
    });
});

export default app;
