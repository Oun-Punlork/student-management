import { connectDB } from '../config/db.js';
import app from '../src/app.js';

let connection;

export default async function handler(req, res) {
  try {
    connection ||= connectDB();
    await connection;
    return app(req, res);
  } catch (error) {
    connection = undefined;
    console.error('Vercel API request failed:', error);
    return res.status(503).json({ message: 'The service is temporarily unavailable.' });
  }
}
