import { connectDB, disconnectDB } from '../config/db.js';
import app from './app.js';

const port = process.env.PORT || 3000;
let server;
let isShuttingDown = false;

const shutdown = async (exitCode) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    if (server) {
        await new Promise((resolve) => server.close(resolve));
    }
    await disconnectDB();
    process.exit(exitCode);
};

const startServer = async () => {
    try {
        await connectDB();
        server = app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Server failed to start:', error.message);
        await disconnectDB();
        process.exit(1);
    }
};

startServer();

process.on('unhandledRejection', async (err) => {
    console.error(`Error: ${err.message}`);
    await shutdown(1);
});

process.on('uncaughtException', async (err) => {
    console.error(`Error: ${err.message}`);
    await shutdown(1);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully.');
    shutdown(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully.');
    shutdown(0);
});
