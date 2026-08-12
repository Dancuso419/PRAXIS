const prisma = require('../prismaClient');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const { generateToken } = require('../utils/generateToken');
const { sendEmail } = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');

async function register(req, res) {
  const { fullName, matricNumber, email, password, faculty, department, level } = req.body;

  if (!fullName || !matricNumber || !email || !password || !faculty || !department || !level) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || 'praxis.edu';
  if (!email.toLowerCase().endsWith(`@${allowedDomain}`)) {
    return res.status(400).json({ error: `Email must belong to the institution domain: @${allowedDomain}` });
  }

  const matricRegex = /^[a-zA-Z0-9/-]{5,20}$/;
  if (!matricRegex.test(matricNumber)) {
    return res.status(400).json({ error: 'Invalid matric number format. Only alphanumeric characters, dashes, and slashes are allowed (5-20 characters).' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { matricNumber }],
    },
  });

  if (existingUser) {
    const field = existingUser.email === email ? 'email' : 'matric number';
    return res.status(409).json({ error: `A user with this ${field} already exists.` });
  }

  const hashedPassword = await hashPassword(password);

  try {
    // Email verification is disabled at this stage: accounts are active on creation.
    const user = await prisma.user.create({
      data: {
        fullName,
        matricNumber,
        email: email.toLowerCase(),
        password: hashedPassword,
        faculty,
        department,
        level,
        isVerified: true,
      },
    });

    return res.status(201).json({
      message: 'Registration successful. You can now sign in.',
      userId: user.id,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      const targets = error.meta?.target || [];
      const field = targets.includes('email') ? 'email' : 'matric number';
      return res.status(409).json({ error: `A user with this ${field} already exists.` });
    }
    throw error;
  }
}

async function verifyEmail(req, res) {
  const { token } = req.params;

  const record = await prisma.verificationToken.findUnique({ where: { token } });

  if (!record || record.expiresAt < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired verification token.' });
  }

  await prisma.user.update({
    where: { id: record.userId },
    data: { isVerified: true },
  });

  await prisma.verificationToken.delete({ where: { id: record.id } });

  return res.json({ message: 'Email verified successfully. You can now log in.' });
}

async function resendVerification(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  if (!user) {
    return res.status(404).json({ error: 'No account found with this email.' });
  }

  if (user.isVerified) {
    return res.status(400).json({ error: 'Account is already verified.' });
  }

  await prisma.verificationToken.deleteMany({ where: { userId: user.id } });

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.verificationToken.create({
    data: { token, userId: user.id, type: 'EMAIL_VERIFICATION', expiresAt },
  });

  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await sendEmail({
    to: user.email,
    subject: 'Verify your Praxis account',
    html: `<h2>Welcome to Praxis</h2><p>Click the link below to verify your account:</p><a href="${verifyUrl}">${verifyUrl}</a><p>This link expires in 24 hours.</p>`,
  });

  return res.json({ message: 'Verification email resent.' });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const valid = await comparePassword(password, user.password);

  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Email verification gate is disabled at this stage.

  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  return res.json({
    message: 'Login successful.',
    token: accessToken,
    user: {
      id: user.id,
      fullName: user.fullName,
      matricNumber: user.matricNumber,
      email: user.email,
      faculty: user.faculty,
      department: user.department,
      level: user.level,
      role: user.role,
    },
  });
}

async function forgotPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  if (!user) {
    return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
  }

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt },
  });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await sendEmail({
    to: user.email,
    subject: 'Reset your Praxis password',
    html: `<h2>Password Reset</h2><p>Click the link below to reset your password:</p><a href="${resetUrl}">${resetUrl}</a><p>This link expires in 1 hour.</p>`,
  });

  return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
}

async function resetPassword(req, res) {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const record = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!record || record.expiresAt < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired reset token.' });
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: record.userId },
    data: { password: hashedPassword },
  });

  await prisma.passwordResetToken.delete({ where: { id: record.id } });

  return res.json({ message: 'Password reset successful. You can now log in.' });
}

const SAFE_USER_FIELDS = {
  id: true,
  fullName: true,
  matricNumber: true,
  email: true,
  faculty: true,
  department: true,
  level: true,
  role: true,
  isVerified: true,
  createdAt: true,
};

async function getMe(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: SAFE_USER_FIELDS,
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  return res.json(user);
}

async function updateProfile(req, res) {
  const { fullName, faculty, department, level } = req.body;

  const data = {};
  if (fullName !== undefined) data.fullName = String(fullName).trim();
  if (faculty !== undefined) data.faculty = String(faculty).trim();
  if (department !== undefined) data.department = String(department).trim();
  if (level !== undefined) data.level = String(level).trim();

  if (data.fullName === '') {
    return res.status(400).json({ error: 'Full name cannot be empty.' });
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'No changes provided.' });
  }

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data,
    select: SAFE_USER_FIELDS,
  });

  return res.json(user);
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters.' });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const valid = await comparePassword(currentPassword, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Current password is incorrect.' });
  }

  const hashedPassword = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  return res.json({ message: 'Password updated successfully.' });
}

module.exports = {
  register,
  verifyEmail,
  resendVerification,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  changePassword,
};
