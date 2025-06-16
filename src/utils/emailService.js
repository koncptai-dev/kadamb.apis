const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,     // smtp.gmail.com
  port: 587,     // 587
  secure: false,                   // false for port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false      // For local dev or self-signed certs
  } 
});

// 1. For forgot password
exports.sendResetEmail = async (email, code) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,  // sender address
      to: email,
      subject: 'Password Reset Code',
      text: `Your password reset code is: ${code}`,
    });
    console.log('Reset email sent:', info.response);
  } catch (error) {
    console.error('Error sending reset email:', error);
    throw error;
  }
};

// 2. For agent registration credentials
exports.sendCredentialsEmail = async (email, associateCode, password) => {
  try {
    const loginUrl = process.env.LOGIN_URL || 'http://localhost:3000/login';
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,  // sender address
      to: email,
      subject: 'Your Agent Login Credentials',
      text: `Welcome to Kadam RealEstate!\n\nYour login credentials are:\nAssociate Code: ${associateCode}\nPassword: ${password}\n\nLogin here: ${loginUrl}\n\nPlease log in and keep your credentials secure.`,
    });
    console.log('Credentials email sent:', info.response);
  } catch (error) {
    console.error('Error sending credentials email:', error);
    throw error;
  }
};
