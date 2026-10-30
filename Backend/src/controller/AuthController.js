import bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'node:crypto';
import { prisma } from '../../config/db.js';
import transporter, { mailFrom } from '../../config/mail.js';
import { generatetoken } from '../utils/generatetoken.js';

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

const hashVerificationToken = (token) => createHash('sha256').update(token).digest('hex');

const sendVerificationEmail = async (email, token) => {
  const verificationUrl = new URL('/verify-email', process.env.FRONTEND_URL || 'http://localhost:5173');
  verificationUrl.searchParams.set('token', token);

  await transporter.sendMail({
    from: mailFrom,
    to: email,
    subject: 'Verify your Student Portal email',
    text: `Verify your email address by opening this link: ${verificationUrl.toString()}`,
    html: `<p>Verify your email address to sign in to Student Portal.</p><p><a href="${verificationUrl.toString()}">Verify email</a></p><p>This link expires in 24 hours.</p>`,
  });
};

const createVerificationToken = async (transaction, email) => {
  const token = randomBytes(32).toString('hex');
  await transaction.verificationToken.deleteMany({ where: { email } });
  await transaction.verificationToken.create({
    data: {
      email,
      token: hashVerificationToken(token),
      expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
    },
  });
  return token;
};

export const register = async (req, res) => {
  try {
    const username = req.body.username?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    if (username.length < 2 || username.length > 100) {
      return res.status(400).json({ message: 'Username must contain 2 to 100 characters.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email address format' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must contain at least 8 characters.' });
    }

    const hashPassword = await bcrypt.hash(password, 12);
    const user = await prisma.$transaction(async (transaction) => {
      const existingUser = await transaction.user.findFirst({
        where: {
          OR: [{ email }, { username }],
        },
        select: { email: true },
      });

      if (existingUser) {
        const error = new Error(
          existingUser.email === email
            ? 'Email is already registered'
            : 'Username is already taken',
        );
        error.statusCode = 400;
        throw error;
      }

      const createdUser = await transaction.user.create({
        data: {
          username,
          email,
          password: hashPassword,
          role: 'STUDENT',
        },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
      });

      let student = await transaction.student.findUnique({
        where: { userId: createdUser.id },
      });

      if (!student) {
        const nameParts = username.split(/\s+/).filter(Boolean);
        const firstName = nameParts.shift() || username;
        const lastName = nameParts.join(' ') || 'Student';

        student = await transaction.student.create({
          data: {
            studentCode: `STU-${String(createdUser.id).padStart(6, '0')}`,
            firstName,
            lastName,
            status: 'ACTIVE',
            userId: createdUser.id,
          },
        });
      }

      const verificationToken = await createVerificationToken(transaction, email);
      return { user: { ...createdUser, student }, verificationToken };
    });

    try {
      await sendVerificationEmail(email, user.verificationToken);
    } catch (error) {
      console.error('Registration verification email error:', error);
      return res.status(503).json({
        code: 'EMAIL_DELIVERY_FAILED',
        message: 'Your account was created, but the verification email could not be sent. Request a new email from the login page.',
      });
    }

    return res.status(201).json({
      status: 'success',
      message: 'Registration successful! Check your email and verify your address before signing in.',
      data: {
        user: user.user,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 'P2002') {
      const field = error.meta?.target?.includes('username') ? 'Username' : 'Email';
      return res.status(400).json({ message: `${field} is already registered` });
    }
    return res.status(error.statusCode || 500).json({ message: error.statusCode ? error.message : 'Error registering user' });
  }
};

export const login = async (req, res) => {
  try {
    const identifier = (req.body.email || req.body.username || req.body.identifier)?.trim();
    const password = req.body.password;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Email/username and password are required.' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase() },
          { username: identifier },
        ],
      },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        role: true,
        status: true,
        tokenVersion: true,
        emailVerifiedAt: true,
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'User does not exist. Please check your credentials or register.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid password. Please try again.' });
    }

    if (!user.emailVerifiedAt) {
      return res.status(403).json({
        code: 'EMAIL_NOT_VERIFIED',
        message: 'You need to verify your email address before you can sign in.',
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ message: 'This account is inactive. Contact an administrator.' });
    }

    const token = generatetoken(user.id, user.tokenVersion, res);

    return res.status(200).json({
      status: 'success',
      token,
      redirect: user.role === 'ADMIN' ? '/dashboard' : '/userdashboard',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: String(user.role || 'STUDENT').toUpperCase(),
        },
        token,
        role: String(user.role || 'STUDENT').toUpperCase(),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const token = req.body.token;
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/i.test(token)) {
    return res.status(400).json({ message: 'This verification link is invalid or has expired.' });
  }

  try {
    const tokenHash = hashVerificationToken(token);
    const verification = await prisma.verificationToken.findUnique({
      where: { token: tokenHash },
    });

    if (!verification || verification.expiresAt <= new Date()) {
      return res.status(400).json({ message: 'This verification link is invalid or has expired.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: verification.email },
      select: { emailVerifiedAt: true },
    });
    if (user?.emailVerifiedAt) {
      return res.status(200).json({ message: 'Email verified. You can now sign in.' });
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.user.update({
        where: { email: verification.email },
        data: { emailVerifiedAt: new Date() },
      });
    });

    return res.status(200).json({ message: 'Email verified. You can now sign in.' });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({ message: 'Unable to verify your email right now.' });
  }
};

export const resendVerificationEmail = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ message: 'Email address is required.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { emailVerifiedAt: true },
    });

    if (!user || user.emailVerifiedAt) {
      return res.status(200).json({
        message: 'If this address needs verification, a new email has been sent.',
      });
    }

    const token = await prisma.$transaction((transaction) => createVerificationToken(transaction, email));
    try {
      await sendVerificationEmail(email, token);
    } catch (error) {
      console.error('Resend verification email error:', error);
      return res.status(503).json({ message: 'Unable to send the verification email. Please try again later.' });
    }

    return res.status(200).json({
      message: 'If this address needs verification, a new email has been sent.',
    });
  } catch (error) {
    console.error('Error requesting verification email:', error);
    return res.status(500).json({ message: 'Unable to request a verification email right now.' });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        profileImage: true,
        profileImageMimeType: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const { profileImage, profileImageMimeType, ...userDetails } = user;
    return res.status(200).json({
      status: 'success',
      data: {
        user: {
          ...userDetails,
          avatarUrl: profileImage
            ? `data:${profileImageMimeType};base64,${Buffer.from(profileImage).toString('base64')}`
            : null,
        },
      },
    });
  } catch (error) {
    console.error('Error loading current user:', error);
    return res.status(500).json({ message: 'Failed to load your profile.' });
  }
};

const PROFILE_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;

const hasValidImageSignature = (image, mimeType) => {
  if (mimeType === 'image/jpeg') {
    return image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff;
  }
  if (mimeType === 'image/png') {
    return image.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  return mimeType === 'image/webp'
    && image.toString('ascii', 0, 4) === 'RIFF'
    && image.toString('ascii', 8, 12) === 'WEBP';
};

export const uploadProfileImage = async (req, res) => {
  const mimeType = req.get('content-type');
  if (!PROFILE_IMAGE_TYPES.has(mimeType)) {
    return res.status(415).json({ message: 'Upload a JPEG, PNG, or WebP profile image.' });
  }
  if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
    return res.status(400).json({ message: 'Choose a profile image to upload.' });
  }
  if (req.body.length > MAX_PROFILE_IMAGE_BYTES) {
    return res.status(413).json({ message: 'Profile images must be 5 MB or smaller.' });
  }
  if (!hasValidImageSignature(req.body, mimeType)) {
    return res.status(400).json({ message: 'The selected file is not a valid image.' });
  }

  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        profileImage: req.body,
        profileImageMimeType: mimeType,
      },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Profile image uploaded.',
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return res.status(500).json({ message: 'Failed to save the profile image.' });
  }
};

export const logout = async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { tokenVersion: { increment: 1 } },
    });

    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Error logging out' });
  }
};