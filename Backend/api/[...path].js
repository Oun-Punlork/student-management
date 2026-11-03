import { connectDB } from '../config/db.js';
import app, { corsMiddleware } from '../src/app.js';

let connection;

export default async function handler(req, res) {
  try {
    await new Promise((resolve, reject) => {
      let completed = false;
      const finish = (error) => {
        if (completed) return;
        completed = true;
        if (error) reject(error);
        else resolve();
      };

      res.once('finish', () => finish());
      corsMiddleware(req, res, (error) => {
        if (error) return finish(error);
        req.corsHandled = true;
        finish();
      });
    });

    if (res.writableEnded) return;

    const requestPath = new URL(req.url, 'http://localhost').pathname;
    if (req.method === 'GET' && requestPath === '/') {
      return app(req, res);
    }

    connection ||= connectDB();
    await connection;
    return app(req, res);
  } catch (error) {
    connection = undefined;
    console.error('Vercel API request failed:', error);
    return res.status(503).json({ message: 'The service is temporarily unavailable.' });
  }
}
