import jwt from 'jsonwebtoken';
import { prisma } from "../../config/db.js";

export const authmiddleware = async (req, res, next) => {
    if (req.method === "OPTIONS") {
        return next();
    }

    try {
        const authHeader = req.headers.authorization;
        const bearerToken = authHeader?.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : null;
        const cookieToken = req.headers.cookie
            ?.split(";")
            .map((cookie) => cookie.trim())
            .find((cookie) => cookie.startsWith("token="))
            ?.slice("token=".length);
        const token = bearerToken || cookieToken;

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                role: true,
                status: true,
                tokenVersion: true,
            },
        });

        if (!user) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
        if ((decoded.tokenVersion ?? 0) !== user.tokenVersion) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
        if (user.status !== 'ACTIVE') {
            return res.status(403).json({ message: "This account is inactive" });
        }
        req.user = user;
        next(); 
    } catch (error) {
        console.error("Auth error:", error);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

export const requireRole = (role) => (req, res, next) => {
    if (req.user?.role !== role) {
        return res.status(403).json({ message: "Admin access required" });
    }

    next();
};