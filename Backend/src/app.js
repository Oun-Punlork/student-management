import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import AuthRoute from "./routes/AuthRoute.js";
import StudentRoute from "./routes/StudentRoute.js";
import ScoreRoute from "./routes/ScoreRoute.js";
import AttendanceRoute from "./routes/AttendanceRoute.js";
import DashboardRoute from "./routes/DashboardRoute.js";
import UserRoute from "./routes/UserRoute.js";
import InformationRoute from "./routes/InformationRoute.js";

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', AuthRoute);
app.use('/api', StudentRoute);
app.use('/api', ScoreRoute);
app.use('/api', AttendanceRoute);
app.use('/api', DashboardRoute);
app.use('/api', UserRoute);
app.use('/api', InformationRoute);

app.use((error, _req, res, _next) => {
    console.error('Unhandled request error:', error);
    const status = error.status === 413 ? 413 : 500;
    const message = status === 413
        ? 'Uploaded images must be 5 MB or smaller.'
        : 'Internal server error';
    res.status(status).json({ message });
});

export default app;
