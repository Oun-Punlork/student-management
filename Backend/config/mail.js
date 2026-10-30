import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

const user = process.env.SMTP_USER || process.env.GMAIL_USER;
const pass = (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || process.env.USER_PASSgoogle || '').replace(/\s+/g, '');
const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || (host ? 587 : 465));

const transportOptions = host
  ? {
      host,
      port,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
      auth: { user, pass },
    }
  : {
      service: 'gmail',
      auth: { user, pass },
    };

const transporter = nodemailer.createTransport(transportOptions);

export const mailFrom = process.env.MAIL_FROM || `"Student Portal" <${user}>`;
export default transporter;
